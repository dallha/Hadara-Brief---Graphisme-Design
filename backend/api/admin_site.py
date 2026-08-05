from django.contrib import admin
from django.db.models import Sum
from django.template.response import TemplateResponse

from .models import Brief, PortfolioItem, StoreProduct, Template


class HadaraAdminSite(admin.AdminSite):
    site_title = "Hadara Studio Admin"
    site_header = "Hadara"
    index_title = "Tableau de Bord"

    def index(self, request, extra_context=None):
        # --- KPI Stats ---
        pending_briefs = Brief.objects.filter(status__in=['nouveau', 'pending']).count()
        all_briefs_count = Brief.objects.count()

        total_revenue_agg = Brief.objects.exclude(
            status__in=['rejected', 'refusé']
        ).aggregate(total=Sum('quoted_price_fcfa'))
        total_revenue = total_revenue_agg['total'] or 0

        active_products = StoreProduct.objects.filter(visible=True).count()
        latest_briefs = Brief.objects.order_by('-created_at')[:6]

        context = {
            'kpi_pending_briefs': pending_briefs,
            'kpi_all_briefs': all_briefs_count,
            'kpi_total_revenue': f"{total_revenue:,}".replace(',', '\u202f'),
            'kpi_active_products': active_products,
            'kpi_latest_briefs': latest_briefs,
        }

        if extra_context:
            context.update(extra_context)

        return super().index(request, context)


hadara_admin_site = HadaraAdminSite(name='hadara_admin')
