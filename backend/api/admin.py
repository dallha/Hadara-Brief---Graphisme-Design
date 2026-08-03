from django.contrib import admin

from .models import Brief, PortfolioItem, StoreProduct, Template

admin.site.register(Brief)
admin.site.register(Template)
admin.site.register(PortfolioItem)
admin.site.register(StoreProduct)
