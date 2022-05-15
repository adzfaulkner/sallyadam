package token

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func Test_Token(t *testing.T) {
	t.Parallel()

	now, _ := time.Parse(time.RFC3339, "2022-01-01T00:00:00+00:00")

	t.Run("Test create token", func(t *testing.T) {
		t.Parallel()

		handler := Handler{
			secret:     "test",
			expireMins: 1,
			now:        now,
		}

		to, _ := handler.CreateToken("test")

		assert.Equal(t, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRob3JpemVkIjp0cnVlLCJleHAiOjE2NDA5OTUyNjAsInVzZXJfaWQiOiJ0ZXN0In0.EGHX_PiEM8D2i_94KPRf66NWPYwZ40NwqNMhZq9lcaU", to)
	})

	t.Run("Test expired token", func(t *testing.T) {
		t.Parallel()

		tt, _ := time.Parse(time.RFC3339, "2022-01-01T00:00:00+00:00")

		handler := Handler{
			secret:     "test",
			expireMins: 1,
			now:        tt,
		}

		tok, _ := handler.CreateToken("test")

		too := "Bearer " + tok

		_, err := handler.VerifyToken(too)

		assert.Equal(t, "error occurred whilst verifying token: Token is expired", err.Error())
	})

	t.Run("Test verify invalid token", func(t *testing.T) {
		t.Parallel()

		now, _ := time.Parse(time.RFC3339, "2022-01-01T00:00:00+00:00")

		handler := Handler{
			secret:     "test",
			expireMins: 1,
			now:        now,
		}

		too := "Bearer invalid"

		_, err := handler.VerifyToken(too)

		assert.Equal(t, "error occurred whilst verifying token: token contains an invalid number of segments", err.Error())
	})

	t.Run("Test verify active token", func(t *testing.T) {
		t.Parallel()

		now := time.Now()

		handler := Handler{
			secret:     "test",
			expireMins: 15,
			now:        now,
		}

		to, _ := handler.CreateToken("test")

		too := "Bearer " + to

		userID, _ := handler.VerifyToken(too)

		assert.Equal(t, "test", userID)
	})
}

func Test_NewHandler(t *testing.T) {
	t.Parallel()

	now := time.Time{}

	sut := NewHandler("secret", 0, now)

	assert.Equal(t, "secret", sut.secret)
	assert.Equal(t, 0, sut.expireMins)
	assert.Equal(t, now, sut.now)
}
