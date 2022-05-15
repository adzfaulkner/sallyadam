package cookie

import (
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func Test_HandlerCreateCookie(t *testing.T) {
	t.Parallel()

	sut := Handler{
		domain: "http://test",
		secure: false,
	}

	expires := time.Time{}

	res := sut.CreateCookie("test", "abc", &expires)

	assert.Equal(t, "test", res.Name)
	assert.Equal(t, "abc", res.Value)
	assert.Equal(t, expires, res.Expires)
	assert.Equal(t, false, res.Secure)
	assert.Equal(t, "http://test", res.Domain)
	assert.Equal(t, http.SameSiteNoneMode, res.SameSite)
	assert.Equal(t, "test=abc; HttpOnly; SameSite=None", res.String())
}

func Test_HandlerGetCookieValueFromString(t *testing.T) {
	t.Parallel()

	sut := Handler{
		domain: "http://test",
		secure: false,
	}

	cookieStr := "a=1; b=2; C=3"

	res := sut.GetCookieValueFromString(cookieStr, "a")

	assert.Equal(t, "1", res)

	res = sut.GetCookieValueFromString(cookieStr, "b")

	assert.Equal(t, "2", res)

	res = sut.GetCookieValueFromString(cookieStr, "c")

	assert.Equal(t, "3", res)

	res = sut.GetCookieValueFromString(cookieStr, "d")

	assert.Equal(t, "", res)
}

func Test_NewHandler(t *testing.T) {
	t.Parallel()

	res := NewHandler("domain", false)

	assert.Equal(t, "domain", res.domain)
	assert.False(t, res.secure)
}
