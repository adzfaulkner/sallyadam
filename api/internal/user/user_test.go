package user

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCreateList(t *testing.T) {
	t.Parallel()

	exp := List{
		"ID1": {
			Username: "UsrA",
			Password: "PwdA",
		},
		"ID2": {
			Username: "UsrB",
			Password: "PwdB",
		},
	}

	json := []byte(fmt.Sprintf(`{%q:{"username":%q,"password":%q},%q:{"username":%q,"password":%q}}`, "ID1", "UsrA", "PwdA", "ID2", "UsrB", "PwdB"))
	list, _ := createList(json)
	assert.Equal(t, exp, list)
}

func TestCreateMap(t *testing.T) {
	t.Parallel()

	list := List{
		"ID1": {
			Username: "UsrA",
			Password: "PwdA",
		},
		"ID2": {
			Username: "UsrB",
			Password: "PwdB",
		},
	}

	exp := Map{
		"UsrA": "ID1",
		"UsrB": "ID2",
	}

	res := createMap(list)
	assert.Equal(t, exp, res)
}

func TestNewRepository(t *testing.T) {
	t.Parallel()

	exp := List{
		"ID1": {
			Username:  "UsrA",
			Password:  "PwdA",
			Firstname: "TestyA",
			Surname:   "TestA",
		},
		"ID2": {
			Username:  "UsrB",
			Password:  "PwdB",
			Firstname: "TestyB",
			Surname:   "TestB",
		},
	}

	exp2 := Map{
		"UsrA": "ID1",
		"UsrB": "ID2",
	}

	json := []byte(
		fmt.Sprintf(
			`{%q:{"username":%q,"password":%q,"firstname":%q,"surname":%q},%q:{"username":%q,"password":%q,"firstname":%q,"surname":%q}}`,
			"ID1", "UsrA", "PwdA", "TestyA", "TestA", "ID2", "UsrB", "PwdB", "TestyB", "TestB",
		),
	)
	repo, _ := NewRepository(json)
	assert.Equal(t, exp, repo.List)
	assert.Equal(t, exp2, repo.Map)
}

func TestFindById(t *testing.T) {
	t.Parallel()

	usr := User{
		Username:  "UsrA",
		Password:  "PwdA",
		Firstname: "Testy",
		Surname:   "Test",
	}

	usrList := List{
		"ID1": usr,
	}

	usrMap := Map{}

	sut := Repository{
		List: usrList,
		Map:  usrMap,
	}

	usrID, res := sut.FindByID("invalid")
	assert.Equal(t, User{}, res)
	assert.Nil(t, usrID)

	usrID, res = sut.FindByID("ID1")
	assert.Equal(t, usr, res)
	assert.Equal(t, ID("ID1"), *usrID)
}

func TestFindByUsername(t *testing.T) {
	t.Parallel()

	usr := User{
		Username:  "UsrA",
		Password:  "PwdA",
		Firstname: "Testy",
		Surname:   "Test",
	}

	usrList := List{
		"ID1": usr,
	}

	usrMap := Map{
		"UsrA": "ID1",
	}

	sut := Repository{
		List: usrList,
		Map:  usrMap,
	}

	usrID, res := sut.FindByUsername("invalid")
	assert.Nil(t, res)
	assert.Nil(t, usrID)

	usrID, res = sut.FindByUsername("UsrA")
	assert.Equal(t, usr, *res)
	assert.Equal(t, ID("ID1"), *usrID)
}
