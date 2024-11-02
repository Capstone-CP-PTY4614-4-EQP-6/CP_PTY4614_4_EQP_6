import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _


class StrongPasswordValidator:
    def validate(self, password, user=None):
        if len(password) < 8:
            raise ValidationError(
                _("La contraseña debe tener al menos 8 caracteres.")
            )
        if not re.search(r'[A-Z]', password):
            raise ValidationError(
                _("La contraseña debe contener al menos una letra mayúscula.")
            )
        if not re.search(r'[a-z]', password):
            raise ValidationError(
                _("La contraseña debe contener al menos una letra minúscula.")
            )
        if not re.search(r'[0-9]', password):
            raise ValidationError(
                _("La contraseña debe contener al menos un número.")
            )
        if not re.search(r'[@$!%*?&]', password):
            raise ValidationError(
                _("La contraseña debe contener al menos un carácter especial (@, $, !, %, *, ?, &).")
            )

    def get_help_text(self):
        return _(
            "Tu contraseña debe contener al menos 8 caracteres, incluyendo una letra mayúscula, "
            "una letra minúscula, un número y un carácter especial (@, $, !, %, *, ?, &)."
        )
