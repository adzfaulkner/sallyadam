package registry

import (
	"encoding/json"
	"fmt"
)

type Images struct {
	Stripe string `json:"stripe"`
}

type Item struct {
	UUID        string `json:"uuid"`
	Title       string `json:"title"`
	Images      Images `json:"images"`
	Description string `json:"description"`
}

type raw struct {
	Registry []Item `json:"registry"`
}

type Map map[string]int
type ID string

type Repository struct {
	items []Item
	mp    Map
}

func createMap(l []Item) Map {
	var rmap = make(Map)

	for key, element := range l {
		rmap[element.UUID] = key
	}

	return rmap
}

func (repo *Repository) FindByID(id string) (*ID, *Item) {
	if _, ok := repo.mp[id]; ok {
		i := ID(id)
		idx := repo.mp[id]

		return &i, &repo.items[idx]
	}

	return nil, nil
}

func NewRepository(rd []byte) (*Repository, error) {
	var tmp raw

	err := json.Unmarshal(rd, &tmp)

	if err != nil {
		return nil, fmt.Errorf("%w", err)
	}

	mp := createMap(tmp.Registry)

	return &Repository{
		items: tmp.Registry,
		mp:    mp,
	}, nil
}
