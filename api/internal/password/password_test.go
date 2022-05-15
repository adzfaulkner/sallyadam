package password

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGeneratePassword(t *testing.T) {
	t.Parallel()

	pwd := []byte("Testing1234")

	res := GeneratePassword(pwd)
	assert.True(t, len(res) == 60)

	res2 := GeneratePassword(pwd)
	assert.NotEqual(t, res, res2)
}

func TestCheckPassword(t *testing.T) {
	t.Parallel()

	pwd := []byte("Testing1234")
	hashed := GeneratePassword(pwd)

	res := CheckPassword(pwd, hashed)
	assert.True(t, res)

	res = CheckPassword([]byte("testing"), hashed)
	assert.False(t, res)
}
