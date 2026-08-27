import factory
from django.contrib.auth import get_user_model
from apps.applications.models import Application

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        skip_postgeneration_save = True
    email = factory.Sequence(lambda n: f"user{n}@test.local")
    role = User.Role.REVIEWER

    @factory.post_generation
    def password(self, create, extracted, **kwargs):
        self.set_password(extracted or "testpass123")
        if create:
            self.save()


class AdminFactory(UserFactory):
    role = User.Role.ADMIN
    is_staff = True


class AuditorFactory(UserFactory):
    role = User.Role.AUDITOR


class ApplicationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Application
    title = factory.Sequence(lambda n: f"Application {n}")
    owner = factory.SubFactory(UserFactory)                        