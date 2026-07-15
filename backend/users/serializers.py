from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import User, ITSupportProfile, UserRoles

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["username"] = user.username
        token["role"] = user.role.name
        token["first_name"] = user.first_name

        return token
    
    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        user = authenticate(
            username=username,
            password=password
        )

        if user is None:
            User = get_user_model()

            if not User.objects.filter(username=username).exists():
                raise serializers.ValidationError(
                    {
                        "username": "Username does not exist"
                    }
                )
            else:
                raise serializers.ValidationError(
                    {
                        "password": "Incorrect Password"
                    }
                )
        if not user.is_active:
            raise serializers.ValidationError(
                {
                    "account": "Account is inactive"
                }
            )
        return super().validate(attrs)

   
class ITSupportProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ITSupportProfile
        fields = ['user', 'availability_status', 'expertise', 'current_workload', 'workload_limit', 'department']

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'role', 'email', 'first_name', 'last_name', 'user_code']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
class UserRolesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRoles
        fields = ['id', 'name']

class UserListSerializer(serializers.ModelSerializer):
    current_workload = serializers.IntegerField(source='it_support_profile.current_workload', read_only=True)
    expertise = serializers.CharField(source='it_support_profile.expertise', read_only=True)
    availability_status = serializers.CharField(source='it_support_profile.availability_status', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'role', 'current_workload', 'expertise', 'availability_status']