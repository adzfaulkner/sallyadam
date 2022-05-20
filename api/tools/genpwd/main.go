package main

import (
	"fmt"
	"os"
	"strings"

	"github.com/adzfaulkner/sallyadam/internal/password"
)

func getPwdContents() string {
	path, err := os.Getwd()

	if err != nil {
		panic(err.Error())
	}

	pwdRaw, err := os.ReadFile(fmt.Sprintf("%s/tools/genpwd/pwd", path))
	if err != nil {
		panic(err.Error())
	}

	return strings.TrimSpace(string(pwdRaw))
}

func main() {
	genPwd(getPwdContents())
}

func genPwd(pwd string) {
	fmt.Println("Plain pwd is: " + pwd)

	pwdEnc := password.GeneratePassword([]byte(pwd))

	fmt.Println("Encrypted version: " + string(pwdEnc))
}
