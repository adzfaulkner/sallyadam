package cookie

import (
	"strings"
	"time"

	"net/http"
)

type Handler struct {
	domain string
	secure bool
}

func (h *Handler) CreateCookie(name, value string, expires *time.Time) *http.Cookie {
	return &http.Cookie{
		Name:     name,
		Value:    value,
		Domain:   h.domain,
		Expires:  *expires,
		Secure:   h.secure,
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode,
	}
}

func (h *Handler) GetCookieValueFromString(cookieStr, key string) string {
	cookies := strings.Split(cookieStr, ";")

	for _, c := range cookies {
		p := strings.Split(c, "=")
		name := strings.ToLower(p[0])

		if strings.TrimSpace(name) == key {
			return strings.TrimSpace(p[1])
		}
	}

	return ""
}

func NewHandler(domain string, secure bool) *Handler {
	return &Handler{
		domain: domain,
		secure: secure,
	}
}
