package password

import (
	"golang.org/x/crypto/bcrypt"
)

type Check func(supplied []byte) bool

func GeneratePassword(pwd []byte) []byte {
	hash, _ := bcrypt.GenerateFromPassword(pwd, bcrypt.MinCost)

	return hash
}

func Compare(password []byte) Check {
	return func(supplied []byte) bool {
		err := bcrypt.CompareHashAndPassword(password, supplied)

		return err == nil
	}
}
