from django import template
from django.db.models import Sum
from ..models import Brief, StoreProduct

register = template.Library()

@register.simple_tag
def get_dashboard_stats():
    # Nouveaux briefs (statut 'nouveau' par défaut ou 'pending')
    pending_briefs = Brief.objects.filter(status__in=['nouveau', 'pending']).count()
    
    # Chiffre d'affaires estimé (somme des devis hors rejetés)
    total_revenue_aggr = Brief.objects.exclude(status__in=['rejected', 'refusé']).aggregate(total=Sum('quoted_price_fcfa'))
    total_revenue = total_revenue_aggr['total'] or 0
    
    # Nombre de produits en boutique
    active_products = StoreProduct.objects.filter(visible=True).count()
    
    # Derniers briefs (5 derniers)
    latest_briefs = Brief.objects.order_by('-created_at')[:5]
    
    return {
        'pending_briefs': pending_briefs,
        'total_revenue': f"{total_revenue:,}".replace(',', ' '),
        'active_products': active_products,
        'latest_briefs': latest_briefs,
    }
