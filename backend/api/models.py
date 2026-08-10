from django.db import models

class Brief(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de Création")
    status = models.CharField(max_length=50, default='nouveau', verbose_name="Statut du Projet")
    
    # 1. Client Info
    client_name = models.CharField(max_length=200, blank=True, null=True, verbose_name="Client")
    organization = models.CharField(max_length=200, blank=True, null=True, verbose_name="Organisation / Marque")
    whatsapp = models.CharField(max_length=50, blank=True, null=True, verbose_name="WhatsApp")
    email = models.EmailField(blank=True, null=True, verbose_name="Adresse Email")
    city_country = models.CharField(max_length=200, blank=True, null=True, verbose_name="Ville / Pays")
    
    # 2. Project Type
    project_type = models.CharField(max_length=50, blank=True, null=True, verbose_name="Type de Projet")
    project_type_custom = models.CharField(max_length=200, blank=True, null=True, verbose_name="Type de Projet Personnalisé")
    
    # 3. Context & Objectives
    context_description = models.TextField(blank=True, null=True, verbose_name="Contexte & Description")
    primary_objective = models.TextField(blank=True, null=True, verbose_name="Objectif Principal")
    
    # 4. Target Audience
    target_audience = models.TextField(blank=True, null=True, verbose_name="Cible Visée")
    target_audience_chips = models.JSONField(default=list, blank=True, null=True, verbose_name="Tags Cible")
    
    # 5. Message & Content
    main_title = models.CharField(max_length=200, blank=True, null=True, verbose_name="Titre Principal")
    full_text_content = models.TextField(blank=True, null=True, verbose_name="Textes Inclus")
    
    # 6. Style & Direction
    style_preferences = models.JSONField(default=list, blank=True, null=True, verbose_name="Styles Souhaités")
    preferred_colors = models.CharField(max_length=200, blank=True, null=True, verbose_name="Couleurs Préférées")
    avoid_colors = models.CharField(max_length=200, blank=True, null=True, verbose_name="Couleurs à Éviter")
    
    # 7. Technical Format
    technical_format = models.CharField(max_length=50, blank=True, null=True, verbose_name="Format Technique")
    custom_dimensions = models.CharField(max_length=200, blank=True, null=True, verbose_name="Dimensions Spécifiques")
    usage_type = models.CharField(max_length=20, blank=True, null=True, verbose_name="Type d'Usage")
    
    # 8. Budget & Deadline
    budget_range = models.CharField(max_length=50, blank=True, null=True, verbose_name="Fourchette de Budget")
    desired_delivery_date = models.CharField(max_length=50, blank=True, null=True, verbose_name="Date de Livraison Souhaitée")
    critical_deadline = models.CharField(max_length=50, blank=True, null=True, verbose_name="Délai Critique")
    
    # 9. References & Files
    reference_links = models.TextField(blank=True, null=True, verbose_name="Liens de Référence")
    attachments = models.JSONField(default=list, blank=True, null=True, verbose_name="Pièces Jointes")
    deliverable_versions = models.JSONField(default=list, blank=True, null=True, verbose_name="Versions de Livrables (V1, V2, V3)")
    
    # 10. Conditions Validation
    accept_process = models.BooleanField(default=False, blank=True, null=True, verbose_name="Processus Validé")
    accept_deadlines = models.BooleanField(default=False, blank=True, null=True, verbose_name="Délais Validés")
    
    # Admin / Designer fields
    designer_notes = models.TextField(blank=True, null=True, verbose_name="Notes du Designer")
    quoted_price_fcfa = models.IntegerField(blank=True, null=True, verbose_name="Devis Estimé (FCFA)")
    ai_analysis = models.JSONField(blank=True, null=True, verbose_name="Analyse IA Hadara")

    # Liaison optionnelle vers le Client officiel (migration progressive)
    # Les champs client_name/whatsapp/email sont conservés pour rétrocompatibilité
    client = models.ForeignKey(
        'Client',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        verbose_name="Client (Facturation)",
        related_name='briefs'
    )

    def save(self, *args, **kwargs):
        if not self.id:
            from django.db import transaction
            with transaction.atomic():
                last_brief = Brief.objects.select_for_update().order_by('-created_at').first()
                if last_brief and (last_brief.id.startswith('HAD-') or last_brief.id.startswith('HDR-')):
                    try:
                        last_id_num = int(last_brief.id.split('-')[1])
                        self.id = f"HAD-{(last_id_num + 1):04d}"
                    except (ValueError, IndexError):
                        self.id = "HAD-0001"
                else:
                    self.id = "HAD-0001"
                super().save(*args, **kwargs)
            return
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Brief & Projet"
        verbose_name_plural = "Briefs & Projets"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.id} - {self.client_name}"

class Template(models.Model):
    id = models.CharField(max_length=50, primary_key=True, blank=True)
    title = models.CharField(max_length=200, verbose_name="Titre du modèle")
    category = models.CharField(max_length=100, verbose_name="Catégorie")
    project_type = models.CharField(max_length=50, verbose_name="Type de projet")
    technical_format = models.CharField(max_length=50, verbose_name="Format technique")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    
    # Facultatifs
    custom_dimensions = models.CharField(max_length=200, blank=True, null=True, verbose_name="Dimensions")
    default_main_title = models.CharField(max_length=200, blank=True, null=True, verbose_name="Titre par défaut")
    default_full_text_content = models.TextField(blank=True, null=True, verbose_name="Contenu texte par défaut")
    style_preferences = models.JSONField(default=list, blank=True, null=True, verbose_name="Préférences de style")
    preferred_colors = models.CharField(max_length=200, blank=True, null=True, verbose_name="Couleurs souhaitées")
    avoid_colors = models.CharField(max_length=200, blank=True, null=True, verbose_name="Couleurs à éviter")
    default_budget_range = models.CharField(max_length=50, blank=True, null=True, verbose_name="Fourchette de budget")
    suggested_price_fcfa = models.IntegerField(blank=True, null=True, verbose_name="Prix Indicatif (FCFA)")
    usage_count = models.IntegerField(default=0, verbose_name="Nombre d'utilisations")

    def save(self, *args, **kwargs):
        if not self.id:
            from django.db import transaction
            with transaction.atomic():
                last_tpl = Template.objects.select_for_update().order_by('-id').first()
                if last_tpl and last_tpl.id.startswith('TPL-'):
                    try:
                        last_num = int(last_tpl.id.split('-')[1])
                        self.id = f"TPL-{(last_num + 1):04d}"
                    except (ValueError, IndexError):
                        self.id = "TPL-0001"
                else:
                    self.id = "TPL-0001"
                super().save(*args, **kwargs)
            return
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Modèle de Brief"
        verbose_name_plural = "Modèles de Brief"

    def __str__(self):
        return self.title

class PortfolioItem(models.Model):
    id = models.CharField(max_length=50, primary_key=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    title = models.CharField(max_length=200, verbose_name="Titre du projet")
    category = models.CharField(max_length=100, verbose_name="Catégorie")
    image_url = models.TextField(blank=True, null=True, verbose_name="Image du projet (URL ou Upload)")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    badge = models.CharField(max_length=100, blank=True, null=True, verbose_name="Badge Visuel")
    price_estimate = models.CharField(max_length=100, blank=True, null=True, verbose_name="Tarif Indicatif")
    accent_hex = models.CharField(max_length=50, default='#816C07', blank=True, verbose_name="Couleur d'Accent Visuel")
    features = models.JSONField(default=list, blank=True, verbose_name="Livrables Inclus")

    def save(self, *args, **kwargs):
        if not self.id:
            from django.db import transaction
            with transaction.atomic():
                last_item = PortfolioItem.objects.select_for_update().order_by('-created_at').first()
                if last_item and last_item.id.startswith('PRT-'):
                    try:
                        last_id_num = int(last_item.id.split('-')[1])
                        self.id = f"PRT-{(last_id_num + 1):04d}"
                    except (ValueError, IndexError):
                        self.id = "PRT-0001"
                else:
                    self.id = "PRT-0001"
                super().save(*args, **kwargs)  # Dans l'atomic block — rollback si échec
            return
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Projet Portfolio"
        verbose_name_plural = "Portfolio"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.id} - {self.title}"

class StoreProduct(models.Model):
    STATUS_IN_STOCK = 'in_stock'
    STATUS_AVAILABLE_24_48H = 'available_24_48h'
    STATUS_ON_ORDER = 'on_order'
    STATUS_UNAVAILABLE = 'unavailable'

    STATUS_CHOICES = [
        (STATUS_IN_STOCK, 'En stock'),
        (STATUS_AVAILABLE_24_48H, 'Disponible 24-48h'),
        (STATUS_ON_ORDER, 'Sur commande'),
        (STATUS_UNAVAILABLE, 'Indisponible'),
    ]

    id = models.CharField(max_length=50, primary_key=True, blank=True)
    name = models.CharField(max_length=200, verbose_name="Nom du produit")
    brand = models.CharField(max_length=120, blank=True, null=True, verbose_name="Marque")
    category = models.CharField(max_length=100, verbose_name="Catégorie")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    image = models.TextField(blank=True, null=True, verbose_name="Image (URL ou Fichier)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ON_ORDER, verbose_name="Statut Stock")
    featured = models.BooleanField(default=False, verbose_name="En Vedette")
    visible = models.BooleanField(default=True, verbose_name="Visible en Boutique")
    price = models.PositiveIntegerField(blank=True, null=True, verbose_name="Prix (FCFA)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.id:
            from django.db import transaction
            with transaction.atomic():
                last_product = StoreProduct.objects.select_for_update().order_by('-created_at').first()
                if last_product and last_product.id.startswith('PRD-'):
                    try:
                        last_id_num = int(last_product.id.split('-')[1])
                        self.id = f"PRD-{(last_id_num + 1):04d}"
                    except (ValueError, IndexError):
                        self.id = "PRD-0001"
                else:
                    self.id = "PRD-0001"
                super().save(*args, **kwargs)
                return
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Produit Boutique"
        verbose_name_plural = "Hadara Store (Produits)"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.id} - {self.name}"


# ─────────────────────────────────────────────────────────────────────────────
# MODULE FACTURATION & REVENUS — P0.1
# ─────────────────────────────────────────────────────────────────────────────

class Client(models.Model):
    """Client officiel, source de vérité pour la facturation."""

    id = models.CharField(max_length=50, primary_key=True, blank=True)
    name = models.CharField(max_length=200, verbose_name="Nom complet")
    organization = models.CharField(max_length=200, blank=True, null=True, verbose_name="Organisation / Marque")
    whatsapp = models.CharField(max_length=50, blank=True, null=True, verbose_name="WhatsApp")
    email = models.EmailField(blank=True, null=True, verbose_name="Email")
    address = models.TextField(blank=True, null=True, verbose_name="Adresse")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")

    def save(self, *args, **kwargs):
        if not self.id:
            from django.db import transaction
            with transaction.atomic():
                last = Client.objects.select_for_update().order_by('-created_at').first()
                if last and last.id.startswith('CLT-'):
                    try:
                        self.id = f"CLT-{(int(last.id.split('-')[1]) + 1):04d}"
                    except (ValueError, IndexError):
                        self.id = "CLT-0001"
                else:
                    self.id = "CLT-0001"
                super().save(*args, **kwargs)
            return
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Client"
        verbose_name_plural = "Clients"
        ordering = ['name']

    def __str__(self):
        parts = [self.name]
        if self.organization:
            parts.append(self.organization)
        return " — ".join(parts)


def _billing_next_number(doc_type: str, year: int) -> str:
    """Génère le prochain numéro séquentiel annuel par type de document.
    Protégé par un verrou transactionnel pour éviter les doublons.
    Appelé UNIQUEMENT depuis BillingDocument.save() dans une atomic block.
    """
    prefix_map = {"proforma": "PF", "facture": "FA", "avoir": "AV"}
    prefix = prefix_map.get(doc_type, "FA")
    last = BillingDocument.objects.select_for_update().filter(
        doc_type=doc_type,
        document_number__startswith=f"{prefix}-{year}-"
    ).order_by('-document_number').first()

    if last:
        try:
            seq = int(last.document_number.split('-')[-1]) + 1
        except (ValueError, IndexError):
            seq = 1
    else:
        seq = 1
    return f"{prefix}-{year}-{seq:04d}"


class BillingDocument(models.Model):
    """Proforma, Facture ou Avoir — document officiel de facturation."""

    TYPE_PROFORMA = 'proforma'
    TYPE_FACTURE  = 'facture'
    TYPE_AVOIR    = 'avoir'
    TYPE_CHOICES = [
        (TYPE_PROFORMA, 'Proforma'),
        (TYPE_FACTURE,  'Facture'),
        (TYPE_AVOIR,    'Avoir'),
    ]

    # Statuts de paiement — CALCULÉS automatiquement, jamais saisis
    STATUS_BROUILLON     = 'brouillon'
    STATUS_EN_ATTENTE    = 'en_attente'
    STATUS_ACOMPTE       = 'acompte'
    STATUS_PARTIEL       = 'partiel'
    STATUS_PAYE          = 'paye'
    STATUS_EN_RETARD     = 'en_retard'
    STATUS_ANNULE        = 'annule'
    STATUS_CHOICES = [
        (STATUS_BROUILLON,  'Brouillon'),
        (STATUS_EN_ATTENTE, 'En attente de paiement'),
        (STATUS_ACOMPTE,    'Acompte reçu'),
        (STATUS_PARTIEL,    'Partiellement payé'),
        (STATUS_PAYE,       'Payé ✅'),
        (STATUS_EN_RETARD,  'En retard 🔴'),
        (STATUS_ANNULE,     'Annulé'),
    ]

    # Identifiant et type
    document_number = models.CharField(max_length=30, unique=True, verbose_name="Numéro de document")
    doc_type        = models.CharField(max_length=15, choices=TYPE_CHOICES, default=TYPE_PROFORMA, verbose_name="Type")
    payment_status  = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_EN_ATTENTE, verbose_name="Statut de paiement")

    # Relations
    client = models.ForeignKey(Client, null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Client", related_name='billing_documents')
    brief  = models.ForeignKey('Brief', null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Brief / Projet", related_name='billing_documents')

    # Snapshot immuable (conserve les données du client au moment de l'émission)
    billing_client_name     = models.CharField(max_length=200, blank=True, verbose_name="Client (snapshot)")
    billing_organization    = models.CharField(max_length=200, blank=True, verbose_name="Organisation (snapshot)")
    billing_address         = models.TextField(blank=True, verbose_name="Adresse (snapshot)")
    billing_email           = models.CharField(max_length=200, blank=True, verbose_name="Email (snapshot)")
    billing_whatsapp        = models.CharField(max_length=50, blank=True, verbose_name="WhatsApp (snapshot)")

    # Finance (paid_amount et balance_due sont CALCULÉS, jamais stockés)
    subtotal = models.PositiveIntegerField(default=0, verbose_name="Sous-total (FCFA)")
    discount = models.PositiveIntegerField(default=0, verbose_name="Remise (FCFA)")
    total    = models.PositiveIntegerField(default=0, verbose_name="Total net (FCFA)")
    currency = models.CharField(max_length=5, default='XOF', verbose_name="Devise")

    # Dates
    issue_date = models.DateField(auto_now_add=True, verbose_name="Date d'émission")
    due_date   = models.DateField(null=True, blank=True, verbose_name="Date d'échéance")
    notes      = models.TextField(blank=True, verbose_name="Notes / Conditions")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # ── Propriétés calculées ─────────────────────────────────────────────────

    @property
    def paid_amount(self) -> int:
        """Somme réelle des paiements enregistrés."""
        return self.payments.aggregate(s=models.Sum('amount'))['s'] or 0

    @property
    def balance_due(self) -> int:
        """Solde restant à encaisser."""
        return self.total - self.paid_amount

    # ── Méthode métier centrale ──────────────────────────────────────────────

    def refresh_payment_state(self) -> None:
        """Recalcule et persiste le statut de paiement.
        À appeler après chaque ajout ou suppression d'un Payment.
        """
        import datetime
        if self.payment_status == self.STATUS_ANNULE:
            return  # Statut annulé est le seul à ne pas être recalculé

        paid = self.paid_amount
        due  = self.balance_due

        if paid == 0:
            # Vérification En retard
            if self.due_date and self.due_date < datetime.date.today():
                new_status = self.STATUS_EN_RETARD
            else:
                new_status = self.STATUS_EN_ATTENTE
        elif due <= 0:
            new_status = self.STATUS_PAYE
        else:
            # Paiement partiel — distingue "acompte" (premier paiement) de "partiel"
            nb_payments = self.payments.count()
            if nb_payments == 1:
                new_status = self.STATUS_ACOMPTE
            else:
                new_status = self.STATUS_PARTIEL
            # Vérifier quand même si on est en retard sur le solde
            if self.due_date and self.due_date < datetime.date.today():
                new_status = self.STATUS_EN_RETARD

        BillingDocument.objects.filter(pk=self.pk).update(payment_status=new_status)
        self.payment_status = new_status

    # ── Save avec numérotation automatique ──────────────────────────────────

    def save(self, *args, **kwargs):
        # Calcul du total à partir du sous-total et de la remise
        self.total = max(0, self.subtotal - self.discount)

        if not self.document_number:
            from django.db import transaction
            import datetime
            with transaction.atomic():
                year = datetime.date.today().year
                self.document_number = _billing_next_number(self.doc_type, year)
                super().save(*args, **kwargs)
            return
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Document de Facturation"
        verbose_name_plural = "💰 Facturation"
        ordering = ['-created_at']

    def __str__(self):
        client_display = self.billing_client_name or (str(self.client) if self.client else "—")
        return f"{self.document_number} — {client_display} — {self.total:,} FCFA".replace(',', '\u202f')


class BillingLine(models.Model):
    """Ligne de détail d'une facture ou proforma."""

    document   = models.ForeignKey(BillingDocument, on_delete=models.CASCADE, related_name='lines', verbose_name="Document")
    designation = models.CharField(max_length=500, verbose_name="Désignation / Prestation")
    quantity    = models.DecimalField(max_digits=8, decimal_places=2, default=1, verbose_name="Quantité")
    unit_price  = models.PositiveIntegerField(default=0, verbose_name="Prix unitaire (FCFA)")

    @property
    def line_total(self) -> int:
        return int(self.quantity * self.unit_price)

    class Meta:
        verbose_name = "Ligne de facturation"
        verbose_name_plural = "Lignes de facturation"

    def __str__(self):
        return f"{self.designation} — {self.line_total:,} FCFA".replace(',', '\u202f')


class Payment(models.Model):
    """Encaissement enregistré sur un document de facturation."""

    METHOD_WAVE         = 'wave'
    METHOD_ORANGE_MONEY = 'orange_money'
    METHOD_ESPECES      = 'especes'
    METHOD_VIREMENT     = 'virement'
    METHOD_CHEQUE       = 'cheque'
    METHOD_AUTRE        = 'autre'
    METHOD_CHOICES = [
        (METHOD_WAVE,         '🟣 Wave'),
        (METHOD_ORANGE_MONEY, '🟠 Orange Money'),
        (METHOD_ESPECES,      '💵 Espèces'),
        (METHOD_VIREMENT,     '🏦 Virement'),
        (METHOD_CHEQUE,       '📋 Chèque'),
        (METHOD_AUTRE,        '💳 Autre'),
    ]

    id               = models.CharField(max_length=50, primary_key=True, blank=True)
    billing_document = models.ForeignKey(BillingDocument, on_delete=models.CASCADE, related_name='payments', verbose_name="Facture")
    amount           = models.PositiveIntegerField(verbose_name="Montant encaissé (FCFA)")
    method           = models.CharField(max_length=20, choices=METHOD_CHOICES, default=METHOD_WAVE, verbose_name="Méthode de paiement")
    reference_code   = models.CharField(max_length=200, blank=True, verbose_name="Référence (ex: WAVE-XXXXXX)")
    payment_date     = models.DateField(verbose_name="Date du paiement")
    note             = models.CharField(max_length=300, blank=True, verbose_name="Note (ex: Acompte)")
    created_at       = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.id:
            from django.db import transaction
            with transaction.atomic():
                last = Payment.objects.select_for_update().order_by('-created_at').first()
                if last and last.id.startswith('PAY-'):
                    try:
                        self.id = f"PAY-{(int(last.id.split('-')[1]) + 1):04d}"
                    except (ValueError, IndexError):
                        self.id = "PAY-0001"
                else:
                    self.id = "PAY-0001"
                super().save(*args, **kwargs)
        else:
            super().save(*args, **kwargs)
        # Recalculer le statut de paiement après chaque enregistrement
        self.billing_document.refresh_payment_state()

    def delete(self, *args, **kwargs):
        doc = self.billing_document
        super().delete(*args, **kwargs)
        # Recalculer après suppression
        doc.refresh_payment_state()

    class Meta:
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"
        ordering = ['payment_date']

    def __str__(self):
        return f"{self.id} — {self.amount:,} FCFA — {self.get_method_display()}".replace(',', '\u202f')


class ToolUsageLog(models.Model):
    tool_name = models.CharField(max_length=100, verbose_name="Nom de l'outil")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date d'utilisation")
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    details = models.JSONField(default=dict, blank=True)

    class Meta:
        verbose_name = "Utilisation d'outil"
        verbose_name_plural = "Statistiques Outils"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.tool_name} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"

