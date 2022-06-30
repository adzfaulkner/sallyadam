package registry

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewRepository(t *testing.T) {
	t.Parallel()

	exp := []Item{
		{
			UUID:  "UUID1",
			Title: "TITLE1",
			Images: Images{
				Stripe: "IMAGE1",
			},
			Description: "DESCRIPTION1",
		},
		{
			UUID:  "UUID2",
			Title: "TITLE2",
			Images: Images{
				Stripe: "IMAGE2",
			},
			Description: "DESCRIPTION2",
		},
	}

	exp2 := Map{
		"UUID1": 0,
		"UUID2": 1,
	}

	item1 := fmt.Sprintf("%q:%q,%q:%q,%q:{%q:%q},%q:%q", "uuid", "UUID1", "title", "TITLE1", "images", "stripe", "IMAGE1", "description", "DESCRIPTION1")
	item2 := fmt.Sprintf("%q:%q,%q:%q,%q:{%q:%q},%q:%q", "uuid", "UUID2", "title", "TITLE2", "images", "stripe", "IMAGE2", "description", "DESCRIPTION2")
	json := []byte(fmt.Sprintf("{%q:[{%s},{%s}]}", "registry", item1, item2))

	repo, _ := NewRepository(json)
	assert.Equal(t, exp, repo.items)
	assert.Equal(t, exp2, repo.mp)
}

func TestFindById(t *testing.T) {
	t.Parallel()

	item := Item{
		UUID:  "UUID1",
		Title: "TITLE1",
		Images: Images{
			Stripe: "IMAGE1",
		},
		Description: "DESCRIPTION1",
	}

	rmap := Map{
		"UUID1": 0,
	}

	sut := Repository{
		items: []Item{
			item,
		},
		mp: rmap,
	}

	regID, res := sut.FindByID("invalid")
	assert.Nil(t, res)
	assert.Nil(t, regID)

	regID, res = sut.FindByID("UUID1")
	assert.Equal(t, &item, res)
	assert.Equal(t, ID("UUID1"), *regID)
}
