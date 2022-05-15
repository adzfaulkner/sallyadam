package password

import (
	"golang.org/x/crypto/bcrypt"
)

func GeneratePassword(pwd []byte) []byte {
	hash, _ := bcrypt.GenerateFromPassword(pwd, bcrypt.MinCost)

	return hash
}

func CheckPassword(plain, hashed []byte) bool {
	err := bcrypt.CompareHashAndPassword(hashed, plain)

	return err == nil
}
