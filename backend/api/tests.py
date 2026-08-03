from django.test import TestCase
from rest_framework.test import APIClient

from .auth_views import signer
from .models import StoreProduct


class StoreProductApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.token = signer.sign("admin_user")
        self.auth_header = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}

    def test_store_product_crud_persists_and_reads_from_database(self):
        payload = {
            "name": "Clavier Test",
            "brand": "Hadara",
            "category": "Accessoires",
            "description": "Produit de validation API",
            "image": "https://example.com/clavier.jpg",
            "status": "on_order",
            "featured": True,
            "visible": True,
            "price": 15000,
        }

        create_response = self.client.post(
            "/api/store/products/",
            payload,
            format="json",
            **self.auth_header,
        )
        self.assertEqual(create_response.status_code, 201)
        product_id = create_response.data["id"]

        stored_product = StoreProduct.objects.get(pk=product_id)
        self.assertEqual(stored_product.name, payload["name"])
        self.assertEqual(stored_product.status, "on_order")

        patch_response = self.client.patch(
            f"/api/store/products/{product_id}/",
            {"status": "in_stock", "price": 17500},
            format="json",
            **self.auth_header,
        )
        self.assertEqual(patch_response.status_code, 200)

        stored_product.refresh_from_db()
        self.assertEqual(stored_product.status, "in_stock")
        self.assertEqual(stored_product.price, 17500)

        get_response = self.client.get("/api/store/products/")
        self.assertEqual(get_response.status_code, 200)
        self.assertEqual(get_response.data[0]["id"], product_id)
        self.assertEqual(get_response.data[0]["status"], "in_stock")

        delete_response = self.client.delete(
            f"/api/store/products/{product_id}/",
            **self.auth_header,
        )
        self.assertEqual(delete_response.status_code, 204)
        self.assertFalse(StoreProduct.objects.filter(pk=product_id).exists())

    def test_store_product_writes_require_admin_token(self):
        response = self.client.post(
            "/api/store/products/",
            {
                "name": "Produit non autorise",
                "category": "Accessoires",
                "description": "Sans token",
                "status": "on_order",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(StoreProduct.objects.count(), 0)
