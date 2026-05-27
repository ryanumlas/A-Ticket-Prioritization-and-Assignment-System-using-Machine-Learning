# DEPRECATED: Use classification_layer.py and nlp_layer.py instead
# This file is kept for backward compatibility only

from .classification_layer import classify_ticket  # noqa: F401

__all__ = ['classify_ticket']
