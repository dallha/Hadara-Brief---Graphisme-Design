from django.test import TestCase

from hadara_ai.models import PromptTemplate, PromptVersion
from hadara_ai.prompts.engine import PromptEngine, PromptEngineError


class PromptEngineRenderTest(TestCase):
    def setUp(self):
        self.engine = PromptEngine()

        self.template = PromptTemplate.objects.create(
            name="Brief Analyzer",
            slug="brief_analyzer",
            description="Analyse de brief client",
            category="analysis",
        )
        self.version = PromptVersion.objects.create(
            template=self.template,
            version=1,
            system_prompt="Tu es un expert en graphisme.",
            user_prompt_template="Analyse ce brief :\nType: {{type_projet}}\nObjectif: {{objectif}}",
            input_schema={
                "required": ["type_projet", "objectif"],
            },
            model_recommended="llama-3.1-8b-instant",
            temperature=0.2,
            is_active=True,
        )

    def test_render_returns_system_and_user(self):
        result = self.engine.render(
            "brief_analyzer",
            {"type_projet": "logo", "objectif": "Image pro"},
        )
        self.assertIn("system", result)
        self.assertIn("user", result)
        self.assertEqual(result["template_slug"], "brief_analyzer")
        self.assertEqual(result["version"], 1)

    def test_render_replaces_variables(self):
        result = self.engine.render(
            "brief_analyzer",
            {"type_projet": "affiche", "objectif": "Événement"},
        )
        self.assertIn("affiche", result["user"])
        self.assertIn("Événement", result["user"])

    def test_render_missing_variable_raises(self):
        with self.assertRaises(PromptEngineError) as ctx:
            self.engine.render("brief_analyzer", {"type_projet": "logo"})
        self.assertIn("objectif", str(ctx.exception))

    def test_render_template_not_found_raises(self):
        with self.assertRaises(PromptEngineError):
            self.engine.render("nonexistent", {})

    def test_render_no_active_version_raises(self):
        self.version.is_active = False
        self.version.save()

        with self.assertRaises(PromptEngineError) as ctx:
            self.engine.render("brief_analyzer", {"type_projet": "x", "objectif": "y"})
        self.assertIn("Aucune version active", str(ctx.exception))

    def test_render_specific_version(self):
        # Créer une v2
        PromptVersion.objects.create(
            template=self.template,
            version=2,
            system_prompt="Tu es un directeur artistique.",
            user_prompt_template="V2: {{type_projet}}",
            is_active=False,
        )

        result = self.engine.render(
            "brief_analyzer",
            {"type_projet": "logo", "objectif": "test"},
            version_number=2,
        )
        self.assertEqual(result["version"], 2)
        self.assertIn("V2: logo", result["user"])

    def test_render_version_not_found_raises(self):
        with self.assertRaises(PromptEngineError):
            self.engine.render(
                "brief_analyzer",
                {"type_projet": "x", "objectif": "y"},
                version_number=99,
            )

    def test_temperature_and_model_propagated(self):
        result = self.engine.render(
            "brief_analyzer",
            {"type_projet": "logo", "objectif": "test"},
        )
        self.assertEqual(result["model_recommended"], "llama-3.1-8b-instant")
        self.assertEqual(result["temperature"], 0.2)


class PromptEngineListTemplatesTest(TestCase):
    def setUp(self):
        self.engine = PromptEngine()

    def test_list_empty(self):
        result = self.engine.list_templates()
        self.assertEqual(result, [])

    def test_list_with_templates(self):
        t1 = PromptTemplate.objects.create(
            name="Analyzer", slug="analyzer", category="analysis"
        )
        PromptVersion.objects.create(
            template=t1, version=1, system_prompt="s", user_prompt_template="u",
            is_active=True,
        )
        t2 = PromptTemplate.objects.create(
            name="Copywriter", slug="copywriter", category="copywriting"
        )
        PromptVersion.objects.create(
            template=t2, version=1, system_prompt="s", user_prompt_template="u",
            is_active=True,
        )

        result = self.engine.list_templates()
        self.assertEqual(len(result), 2)
        slugs = [t["slug"] for t in result]
        self.assertIn("analyzer", slugs)
        self.assertIn("copywriter", slugs)

    def test_list_shows_active_version(self):
        t = PromptTemplate.objects.create(
            name="Test", slug="test", category="test"
        )
        PromptVersion.objects.create(
            template=t, version=1, system_prompt="s", user_prompt_template="u",
            is_active=False,
        )
        PromptVersion.objects.create(
            template=t, version=2, system_prompt="s", user_prompt_template="u",
            is_active=True,
        )

        result = self.engine.list_templates()
        self.assertEqual(result[0]["active_version"], 2)


class PromptEngineMultiVersionTest(TestCase):
    def setUp(self):
        self.engine = PromptEngine()
        self.template = PromptTemplate.objects.create(
            name="Multi", slug="multi", category="test"
        )
        # v1 inactive
        PromptVersion.objects.create(
            template=self.template, version=1,
            system_prompt="V1 system", user_prompt_template="V1 user",
            is_active=False,
        )
        # v2 active
        PromptVersion.objects.create(
            template=self.template, version=2,
            system_prompt="V2 system", user_prompt_template="V2 {{x}}",
            is_active=True,
        )
        # v3 inactive
        PromptVersion.objects.create(
            template=self.template, version=3,
            system_prompt="V3 system", user_prompt_template="V3 {{x}}",
            is_active=False,
        )

    def test_active_version_is_v2(self):
        result = self.engine.render("multi", {"x": "test"})
        self.assertEqual(result["version"], 2)
        self.assertIn("V2 system", result["system"])
        self.assertIn("V2 test", result["user"])

    def test_can_force_v1(self):
        result = self.engine.render("multi", {"x": "test"}, version_number=1)
        self.assertEqual(result["version"], 1)
        self.assertIn("V1 system", result["system"])
