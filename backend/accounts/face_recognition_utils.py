# accounts/face_recognition_utils.py

import face_recognition
import numpy as np
from .models import FaceRecord
from django.core.files.base import ContentFile
import base64
import io
from PIL import Image


def get_face_encoding(image_path):
    """
    Recibe una imagen y devuelve el encoding del rostro (si se detecta uno).
    """
    image = face_recognition.load_image_file(image_path)
    face_encodings = face_recognition.face_encodings(image)

    if face_encodings:
        return face_encodings[0]
    return None


def compare_faces(encoding1, encoding2, tolerance=0.6):
    """
    Compara dos codificaciones de rostros y devuelve True si coinciden.
    """
    result = face_recognition.compare_faces([encoding1], encoding2, tolerance=tolerance)
    distance = face_recognition.face_distance([encoding1], encoding2)
    return result[0], distance[0]


def save_face_encoding(user, image_path):
    """
    Codifica el rostro de un usuario y lo guarda en FaceRecord.
    """
    encoding = get_face_encoding(image_path)
    if encoding is not None:
        encoding_str = ','.join(map(str, encoding))
        face_record, created = FaceRecord.objects.get_or_create(user=user)
        face_record.face_encoding = encoding_str
        face_record.save()
        return True
    return False


def recognize_face(image_path):
    """
    Compara un rostro en la imagen con los rostros registrados.
    Devuelve el usuario si lo encuentra.
    """
    unknown_encoding = get_face_encoding(image_path)
    if unknown_encoding is None:
        return None

    face_records = FaceRecord.objects.all()
    for record in face_records:
        known_encoding = np.array(list(map(float, record.face_encoding.split(','))))
        result, distance = compare_faces(known_encoding, unknown_encoding)
        if result:
            return record.user

    return None