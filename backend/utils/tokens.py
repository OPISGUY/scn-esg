"""
Token Generator for Email Verification and Password Reset
Generates secure, time-limited tokens
"""

from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.crypto import constant_time_compare
from django.utils.http import base36_to_int, int_to_base36
from django.utils.encoding import force_bytes
import hashlib


class EmailVerificationTokenGenerator(PasswordResetTokenGenerator):
    """
    Generate tokens for email verification
    Similar to password reset tokens but for email verification
    """
    
    def _make_hash_value(self, user, timestamp):
        """
        Hash the user's pk, email, and timestamp
        Email verification tokens include email to invalidate if email changes
        """
        email_field = user.get_email_field_name()
        email = getattr(user, email_field, '') or ''
        
        # Include email_verified status so token becomes invalid once verified
        email_verified = getattr(user, 'email_verified', False)
        
        return f"{user.pk}{user.password}{timestamp}{email}{email_verified}"
    
    def check_token(self, user, token):
        """
        Check that a verification token is correct for the given user
        """
        if not (user and token):
            return False
        
        # Parse the token
        try:
            ts_b36, _ = token.split("-")
        except ValueError:
            return False
        
        try:
            ts = base36_to_int(ts_b36)
        except ValueError:
            return False
        
        # Check token hasn't expired
        if (self._num_seconds(self._now()) - ts) > getattr(self, 'key_salt_timeout', 86400):
            return False
        
        # Check the token (updated for Django 4.2+)
        try:
            return constant_time_compare(
                self._make_token_with_timestamp(user, ts, self.secret),
                token,
            )
        except TypeError:
            # Fallback for older Django versions
            return constant_time_compare(
                self._make_token_with_timestamp(user, ts),
                token,
            )


class PasswordResetTokenGeneratorCustom(PasswordResetTokenGenerator):
    """
    Custom password reset token generator with shorter timeout
    """
    
    # 2 hours instead of default 3 days
    key_salt_timeout = 2 * 60 * 60  # 2 hours in seconds
    
    def _make_hash_value(self, user, timestamp):
        """
        Hash includes password so token becomes invalid after password change
        """
        email_field = user.get_email_field_name()
        email = getattr(user, email_field, '') or ''
        
        # Include last_login to make token single-use in practice
        login_timestamp = '' if user.last_login is None else user.last_login.replace(microsecond=0, tzinfo=None)
        
        return f"{user.pk}{user.password}{login_timestamp}{timestamp}{email}"


# Global instances
email_verification_token = EmailVerificationTokenGenerator()
email_verification_token.key_salt_timeout = 24 * 60 * 60  # 24 hours

password_reset_token = PasswordResetTokenGeneratorCustom()
password_reset_token.key_salt_timeout = 2 * 60 * 60  # 2 hours


def generate_verification_token(user) -> str:
    """
    Generate email verification token for user
    
    Args:
        user: User model instance
        
    Returns:
        Token string
    """
    return email_verification_token.make_token(user)


def check_verification_token(user, token: str) -> bool:
    """
    Verify email verification token
    
    Args:
        user: User model instance
        token: Token string to verify
        
    Returns:
        True if token is valid
    """
    return email_verification_token.check_token(user, token)


def generate_password_reset_token(user) -> str:
    """
    Generate password reset token for user
    
    Args:
        user: User model instance
        
    Returns:
        Token string
    """
    return password_reset_token.make_token(user)


def check_password_reset_token(user, token: str) -> bool:
    """
    Verify password reset token
    
    Args:
        user: User model instance
        token: Token string to verify
        
    Returns:
        True if token is valid
    """
    return password_reset_token.check_token(user, token)
