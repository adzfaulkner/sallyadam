package user

import (
	"encoding/json"
	"fmt"
)

type User struct {
	Username  string `json:"username"`
	Password  string `json:"password"`
	Firstname string `json:"firstname"`
	Surname   string `json:"surname"`
}

type List map[string]User
type Map map[string]string
type ID string

func createList(ud []byte) (List, error) {
	var usrList List

	if err := json.Unmarshal(ud, &usrList); err != nil {
		return nil, fmt.Errorf("unable to unmarshal data: %w", err)
	}

	return usrList, nil
}

func createMap(l List) Map {
	var usrMap = make(Map)

	for key, element := range l {
		usrMap[element.Username] = key
	}

	return usrMap
}

type Repository struct {
	List List
	Map  Map
}

func (repo *Repository) FindByID(id string) (*ID, User) {
	if _, ok := repo.List[id]; ok {
		i := ID(id)

		return &i, repo.List[id]
	}

	return nil, User{}
}

func (repo *Repository) FindByUsername(username string) (*ID, *User) {
	if id, ok := repo.Map[username]; ok {
		i := ID(id)
		usr := repo.List[id]

		return &i, &usr
	}

	return nil, nil
}

func NewRepository(ud []byte) (*Repository, error) {
	list, err := createList(ud)

	if err != nil {
		return nil, err
	}

	umap := createMap(list)

	return &Repository{
		List: list,
		Map:  umap,
	}, nil
}
