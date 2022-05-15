package token

import (
	"fmt"
	"strings"
	"time"

	"github.com/golang-jwt/jwt"
)

const ExpectedNoOfTokenParts = 2

func extractToken(bt string) string {
	strArr := strings.Split(bt, " ")
	if len(strArr) == ExpectedNoOfTokenParts {
		return strArr[1]
	}

	return ""
}

type Handler struct {
	secret     string
	expireMins int
	now        time.Time
}

func (th *Handler) CreateToken(userID string) (string, error) {
	var err error

	atClaims := jwt.MapClaims{}
	atClaims["authorized"] = true
	atClaims["user_id"] = userID
	atClaims["exp"] = th.now.Add(time.Minute * time.Duration(th.expireMins)).Unix()
	at := jwt.NewWithClaims(jwt.SigningMethodHS256, atClaims)
	token, err := at.SignedString([]byte(th.secret))

	if err != nil {
		return "", fmt.Errorf("can not create token: %w", err)
	}

	return token, nil
}

func (th *Handler) VerifyToken(token string) (string, error) {
	ts := extractToken(token)
	tok, err := jwt.Parse(ts, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		return []byte(th.secret), nil
	})

	if err != nil {
		return "", fmt.Errorf("error occurred whilst verifying token: %w", err)
	}

	claims, isOk := tok.Claims.(jwt.MapClaims)

	if !isOk || !tok.Valid {
		return "", fmt.Errorf("token not valid")
	}

	userID, isOk := claims["user_id"].(string)
	if !isOk {
		return "", fmt.Errorf("user id not found: %w", err)
	}

	return userID, nil
}

func NewHandler(secret string, expireMins int, now time.Time) *Handler {
	return &Handler{
		secret:     secret,
		expireMins: expireMins,
		now:        now,
	}
}
