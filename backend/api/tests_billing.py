from django.test import TestCase
from api.models import Client, Brief, BillingDocument, Payment
from django.db.models import Sum
import datetime

class FinancialRulesTest(TestCase):
    def setUp(self):
        self.client = Client.objects.create(name="Test Client", whatsapp="+221770000000")
        
    def test_brief_does_not_affect_ca(self):
        # Brief 20k, Facture 50k, Payment 25k
        brief = Brief.objects.create(main_title="Test", quoted_price_fcfa=20000)
        doc = BillingDocument.objects.create(
            document_number="FA-2026-0001",
            doc_type=BillingDocument.TYPE_FACTURE,
            subtotal=50000,
            brief=brief,
            client=self.client
        )
        pay = Payment.objects.create(
            billing_document=doc,
            amount=25000,
            payment_date=datetime.date.today()
        )
        
        # Test models properties directly
        self.assertEqual(doc.total, 50000)
        
        # We need to refresh doc from db to see properties? No, properties read related Payments dynamically.
        # But let's check
        self.assertEqual(doc.paid_amount, 25000)
        self.assertEqual(doc.balance_due, 25000)
        
        # KPI checks
        docs = BillingDocument.objects.exclude(payment_status='annule').exclude(doc_type='proforma')
        ca_facture = docs.filter(doc_type='facture').aggregate(s=Sum('total'))['s'] or 0
        ca_encaisse = Payment.objects.exclude(billing_document__payment_status='annule').filter(
            billing_document__doc_type='facture'
        ).aggregate(s=Sum('amount'))['s'] or 0
        
        self.assertEqual(ca_facture, 50000)
        self.assertEqual(ca_encaisse, 25000)

    def test_facture_without_brief(self):
        doc = BillingDocument.objects.create(
            document_number="FA-2026-0003",
            doc_type=BillingDocument.TYPE_FACTURE,
            subtotal=30000,
            client=self.client
        )
        pay = Payment.objects.create(
            billing_document=doc,
            amount=30000,
            payment_date=datetime.date.today()
        )
        self.assertEqual(doc.paid_amount, 30000)
        self.assertEqual(doc.payment_status, BillingDocument.STATUS_PAYE)

    def test_proforma_is_excluded(self):
        brief = Brief.objects.create(main_title="Test", quoted_price_fcfa=20000)
        doc_pf = BillingDocument.objects.create(
            document_number="PF-2026-0001",
            doc_type=BillingDocument.TYPE_PROFORMA,
            subtotal=30000,
            brief=brief,
        )
        doc_fa = BillingDocument.objects.create(
            document_number="FA-2026-0001",
            doc_type=BillingDocument.TYPE_FACTURE,
            subtotal=50000,
            brief=brief,
        )
        
        docs = BillingDocument.objects.exclude(payment_status='annule').exclude(doc_type='proforma')
        ca_facture = docs.filter(doc_type='facture').aggregate(s=Sum('total'))['s'] or 0
        self.assertEqual(ca_facture, 50000)

    def test_avoir_deducted(self):
        doc_fa = BillingDocument.objects.create(
            document_number="FA-2026-0001",
            doc_type=BillingDocument.TYPE_FACTURE,
            subtotal=50000,
        )
        doc_av = BillingDocument.objects.create(
            document_number="AV-2026-0001",
            doc_type=BillingDocument.TYPE_AVOIR,
            subtotal=10000,
        )
        docs = BillingDocument.objects.exclude(payment_status='annule').exclude(doc_type='proforma')
        ca_facture = (docs.filter(doc_type='facture').aggregate(s=Sum('total'))['s'] or 0) - (docs.filter(doc_type='avoir').aggregate(s=Sum('total'))['s'] or 0)
        self.assertEqual(ca_facture, 40000)
