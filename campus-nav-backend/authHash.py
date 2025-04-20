import hashlib
import secrets

def hash_password(password, salt=None):
    """Hash a password with a random salt."""
    if salt is None:
        # Generate a new salt if one is not provided
        salt = secrets.token_hex(16)
    hashed_password = hashlib.sha256((salt + password).encode()).hexdigest()
    return hashed_password, salt