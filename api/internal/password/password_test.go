package password

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_GeneratePassword(t *testing.T) {
	t.Parallel()

	pwd := []byte("Testing1236")

	res := GeneratePassword(pwd)
	assert.True(t, len(res) == 60)

	t.Log("pwd", string(res))

	res2 := GeneratePassword(pwd)
	assert.NotEqual(t, res, res2)
}

func Test_Compare(t *testing.T) {
	t.Parallel()

	pwd := []byte("Testing1234")
	hashed := GeneratePassword(pwd)

	pwdChecker := Compare(hashed)

	res := pwdChecker(pwd)
	assert.True(t, res)

	res = pwdChecker([]byte("testing"))
	assert.False(t, res)
}
