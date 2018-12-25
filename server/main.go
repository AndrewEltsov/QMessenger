package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path"
	"strconv"
	"time"

	"github.com/gocraft/web"
	"github.com/golang/glog"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

//Message is the model of QMessenger message
type Message struct {
	ID              bson.ObjectId `json:"id" bson:"_id,omitempty"`
	AuthorID        bson.ObjectId `json:"author_id"`
	MessageBody     string        `json:"message_body"`
	Date            time.Time     `json:"date"`
	ParentMessageID bson.ObjectId `json:"parent_message_id"`
}

//User describes QMessenger user's model
type User struct {
	ID             bson.ObjectId `json:"id" bson:"_id,omitempty"`
	Login          string        `json:"login"`
	HashedPassword string        `json:"hashed_password" bson:"hashed_password"`
	FirstName      string        `json:"first_name"`
	SecondName     string        `json:"second_name"`
	Date           time.Time     `json:"date"`
	Avatar         string        `json:"avatar"`
	IsActive       bool          `json:"is_active"`
}

//ActiveDialogue describes QMessenger active dialogue
type ActiveDialogue struct {
	ID             bson.ObjectId `json:"id" bson:"_id,omitempty"`
	UserID         bson.ObjectId `json:"user_id"`
	InterlocutorID bson.ObjectId `json:"author_id"`
	MessageID      bson.ObjectId `json:"message_id" bson:"message_id,omitempty"`
}

//Session describes QMessenger active dialogue
type Session struct {
	ID     bson.ObjectId `json:"id" bson:"_id,omitempty"`
	Token  string        `json:"token"`
	Time   time.Time     `json:"time"`
	UserID bson.ObjectId `json:"user_id"`
}

//Context is needed by router functions and temporary emppty
type Context struct {
}

var db *mgo.Database

func main() {
	session, err := mgo.Dial("mongodb://127.0.0.1:27017")
	if err != nil {
		glog.Fatal("Impossible to connect to MongoDB")
	}
	defer session.Close()

	db = session.DB("QMessenger")
	/*coll := db.C("users")

	_, err = coll.UpdateAll(bson.M{}, bson.M{
		"$set": bson.M{
			"avatar": ""}})
	if err != nil {
		fmt.Println(err.Error())
	} */

	log.Println("Server is starting...")

	router := web.New(Context{}).
		Post("/login", (*Context).checkUserID).
		Post("/sendMessage", (*Context).sendMessage).
		Post("/loadDialogues", (*Context).loadDialogues).
		Post("/getUser", (*Context).getUser).
		Post("/getMessage", (*Context).getMessage).
		Post("/loadMessages", (*Context).loadMessages).
		Post("/signin", (*Context).signin).
		Post("/getSession", (*Context).getSession).
		Post("/loadUsers", (*Context).loadUsers).
		Get("/images/:pic", (*Context).getPic).
		Post("/sendImage", (*Context).sendImage).
		Post("/beginDialogue", (*Context).beginDialogue).
		Post("/logout", (*Context).logout).
		Post("/register", (*Context).register).
		Post("/changePassword", (*Context).changePassword).
		Post("/changeName", (*Context).changeName).
		Post("/checkNew", (*Context).checkNew)

	err = http.ListenAndServe("localhost:3000", router)
	if err != nil {
		log.Fatal(err.Error())
	}

}

func (c *Context) checkUserID(rw web.ResponseWriter, req *web.Request) {
	reqBytes, err := ioutil.ReadAll(req.Body)
	if err != nil {
		fmt.Println("Не повезло...")
	}
	var jsonObject struct {
		UserID string `json:"user_id"`
	}

	json.Unmarshal(reqBytes, &jsonObject)

	var results []User

	users := db.C("users")
	users.FindId(bson.ObjectIdHex(jsonObject.UserID)).All(&results)

	if results != nil {
		if bson.ObjectIdHex(jsonObject.UserID) == results[0].ID {
			fmt.Println("user is found")
		} else {
			fmt.Println("user is not found")
		}
	} else {
		fmt.Println("no object with id")
	}
}

func (c *Context) sendMessage(rw web.ResponseWriter, req *web.Request) {
	log.Printf("sendMessage function was called\n")
	log.Println(1)
	reqBytes, err := ioutil.ReadAll(req.Body)
	if err != nil {
		fmt.Println(err.Error())
	}
	log.Println(2)
	var jsonObject struct {
		AuthorID        string `json:"author_id"`
		MessageBody     string `json:"message_body"`
		ParentMessageID string `json:"parent_message_id"`
	}
	log.Println(3)
	json.Unmarshal(reqBytes, &jsonObject)
	log.Println(jsonObject)
	log.Println(4)
	coll := db.C("messages")
	log.Println(5)
	id := bson.NewObjectId()
	message := Message{
		ID:              id,
		AuthorID:        bson.ObjectIdHex(jsonObject.AuthorID),
		MessageBody:     jsonObject.MessageBody,
		ParentMessageID: bson.ObjectIdHex(jsonObject.ParentMessageID),
		Date:            time.Now()}
	log.Println(6)
	err = coll.Insert(message)
	if err != nil {
		fmt.Println(err.Error())
	}
	log.Println(7)
	coll = db.C("activeDialogues")
	_, err = coll.UpdateAll(bson.M{"message_id": bson.ObjectIdHex(jsonObject.ParentMessageID)}, bson.M{
		"$set": bson.M{
			"message_id": id}})
	if err != nil {
		fmt.Println(err.Error())
	}
	log.Println(8)
	jsonResponse, err := json.Marshal(message)
	if err != nil {
		fmt.Println("can't be marshalised")
	}
	log.Println(9)
	rw.Write(jsonResponse)

}

func (c *Context) loadDialogues(rw web.ResponseWriter, req *web.Request) {
	log.Printf("loadDialogues function was called\n")
	reqBytes, err := ioutil.ReadAll(req.Body)
	if err != nil {
		fmt.Println("Не повезло...")
	}
	var jsonObject struct {
		UserID string `json:"user_id"`
	}

	json.Unmarshal(reqBytes, &jsonObject)

	var results []ActiveDialogue
	var jsonResponse []byte
	dialogues := db.C("activeDialogues")
	dialogues.Find(bson.M{"userid": bson.ObjectIdHex(jsonObject.UserID)}).All(&results)

	if results != nil {
		jsonResponse, err = json.Marshal(results)
		if err != nil {
			fmt.Println("can't be marshalised")
		}
	} else {
		jsonResponse, err = json.Marshal(struct {
			Error string `json:"error"`
		}{"No dialogues"})
		if err != nil {
			fmt.Println("can't be marshalised")
		}
	}

	rw.Write(jsonResponse)
}

func (c *Context) loadMessages(rw web.ResponseWriter, req *web.Request) {
	log.Printf("loadMessages function was called\n")
	reqBytes, err := ioutil.ReadAll(req.Body)
	if err != nil {
		fmt.Println("Не повезло...")
	}
	log.Println(1)
	var jsonObject struct {
		MessageID string `json:"message_id"`
	}
	log.Println(2)
	err = json.Unmarshal(reqBytes, &jsonObject)
	if err != nil {
		log.Println(err.Error())
	}
	log.Println(3)
	messages := buildMessageChain(bson.ObjectIdHex(jsonObject.MessageID))
	log.Println(4)
	if messages != nil {
		log.Println(5)
		jsonResponse, err := json.Marshal(messages)
		if err != nil {
			fmt.Println("can't be marshalised")
		}
		rw.Write(jsonResponse)
		fmt.Println(rw)
	} else {
		log.Println(6)
		fmt.Println("no objects with this author id")
	}
	log.Println(7)
}

func buildMessageChain(messageID bson.ObjectId) []Message {
	var message *Message
	messageArray := make([]Message, 0)

	if messageID.Hex() == "000000000000000000000000" {
		return messageArray
	}

	messages := db.C("messages")
	err := messages.FindId(messageID).One(&message)
	if err != nil {
		log.Println(err.Error())
	}

	if message != nil {
		if message.ParentMessageID.Hex() != "000000000000000000000000" {
			messageArray = append(buildMessageChain(message.ParentMessageID), *message)
		} else {
			messageArray = append(messageArray, *message)
		}
	} else {
		fmt.Println("so sorry...")
	}

	return messageArray
}

func (c *Context) getUser(rw web.ResponseWriter, req *web.Request) {
	log.Printf("get user function was called\n")
	reqBytes, err := ioutil.ReadAll(req.Body)
	if err != nil {
		fmt.Println("Не повезло...")
	}
	var jsonObject struct {
		UserID string `json:"user_id"`
	}

	json.Unmarshal(reqBytes, &jsonObject)

	var results []User

	users := db.C("users")
	users.Find(bson.M{"_id": bson.ObjectIdHex(jsonObject.UserID)}).All(&results)

	if results != nil {
		if results[0].Avatar == "" {
			results[0].Avatar = "images/empty.jpg"
		}
		jsonResponse, err := json.Marshal(results[0])
		if err != nil {
			fmt.Println("can't be marshalised")
		}
		rw.Write(jsonResponse)
		fmt.Println(rw)
	} else {
		fmt.Println("no objects with this author id")
	}
}

func (c *Context) getMessage(rw web.ResponseWriter, req *web.Request) {
	log.Printf("get message was called\n")
	reqBytes, err := ioutil.ReadAll(req.Body)
	if err != nil {
		fmt.Println("Не повезло...")
	}
	var jsonObject struct {
		MessageID string `json:"message_id"`
	}

	json.Unmarshal(reqBytes, &jsonObject)

	var results []Message

	messages := db.C("messages")
	messages.Find(bson.M{"_id": bson.ObjectIdHex(jsonObject.MessageID)}).All(&results)

	if results != nil {
		jsonResponse, err := json.Marshal(results[0])
		if err != nil {
			fmt.Println("can't be marshalised")
		}
		rw.Write(jsonResponse)
		fmt.Println(rw)
	} else {
		fmt.Println("no objects with this message id")
	}
}

func (c *Context) signin(rw web.ResponseWriter, req *web.Request) {
	log.Println("signin function was called")
	reqBytes, err := ioutil.ReadAll(req.Body)
	if err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
		return
	}
	var jsonObject struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}
	json.Unmarshal(reqBytes, &jsonObject)

	var result User
	col := db.C("users")
	err = col.Find(bson.M{"login": jsonObject.Login}).One(&result)
	if err != nil {
		if err == mgo.ErrNotFound {
			http.Error(rw, "No user with such login", http.StatusUnauthorized)
			return
		}
		http.Error(rw, err.Error(), http.StatusInternalServerError)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(result.HashedPassword), []byte(jsonObject.Password))
	if err != nil {
		http.Error(rw, "Wrong password", http.StatusUnauthorized)
		return
	}

	token := uuid.New()
	col = db.C("sessions")
	session := Session{
		Token:  token.String(),
		Time:   time.Now(),
		UserID: result.ID}
	err = col.Insert(session)
	if err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonResponse, err := json.Marshal(session)
	if err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
		return
	}
	rw.Write(jsonResponse)
}

func (c *Context) getSession(rw web.ResponseWriter, req *web.Request) {
	log.Println("getSession function was called")
	reqBytes, err := ioutil.ReadAll(req.Body)
	if err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
	}
	var jsonObject struct {
		Token string `json:"token"`
	}
	json.Unmarshal(reqBytes, &jsonObject)

	var result Session
	col := db.C("sessions")
	err = col.Find(bson.M{"token": jsonObject.Token}).One(&result)
	if err != nil {
		if err == mgo.ErrNotFound {
			http.Error(rw, err.Error(), http.StatusUnauthorized)
			return
		}
		http.Error(rw, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonResponse, err := json.Marshal(result)
	if err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
		return
	}

	rw.Write(jsonResponse)
}

func (c *Context) loadUsers(rw web.ResponseWriter, req *web.Request) {
	log.Println("loadUsers function was called")

	userList := make([]User, 0)
	users := db.C("users")
	err := users.Find(bson.M{}).All(&userList)
	if err != nil {
		fmt.Println("user not found")
		http.Error(rw, err.Error(), http.StatusInternalServerError)
	}

	if userList != nil {
		for i, user := range userList {
			if user.Avatar == "" {
				userList[i].Avatar = "images/empty.jpg"
			}
		}
		jsonResponse, err := json.Marshal(userList)
		if err != nil {
			fmt.Println("can't be marshalised")
		}
		rw.Write(jsonResponse)
		fmt.Println(rw)
	} else {
		fmt.Println("no users")
	}
}

func (c *Context) getPic(rw web.ResponseWriter, req *web.Request) {
	picPath := path.Join("images", req.PathParams["pic"])

	img, err := ioutil.ReadFile(picPath)
	if _, err = rw.Write(img); err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
	}

	rw.Header().Set("Content-Type", "image/jpeg")
	rw.Header().Set("Content-Length", strconv.Itoa(len(img)))
	if _, err = rw.Write(img); err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
	}
}

func (c *Context) sendImage(rw web.ResponseWriter, req *web.Request) {
	file, fHeader, err := req.FormFile("file")
	if err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
	}
	defer file.Close()

	buf := make([]byte, fHeader.Size)
	_, err = file.Read(buf)
	if err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
	}

	picPath := path.Join("images", fHeader.Filename)
	err = ioutil.WriteFile(picPath, buf, os.FileMode(0777))
	if err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
	}

	coll := db.C("users")
	err = coll.Update(bson.M{"_id": bson.ObjectIdHex(req.FormValue("id"))}, bson.M{
		"$set": bson.M{
			"avatar": picPath}})
	if err != nil {
		fmt.Println(err.Error())
	}
}

func (c *Context) beginDialogue(rw web.ResponseWriter, req *web.Request) {
	log.Println("beginDialogue function was called")
	log.Println(1)
	var ad *ActiveDialogue
	log.Println(2)
	coll := db.C("activeDialogues")
	log.Println(3)
	err := coll.Find(bson.M{"userid": bson.ObjectIdHex(req.FormValue("user_id")),
		"interlocutorid": bson.ObjectIdHex(req.FormValue("friend_id"))}).One(&ad)
	if err != nil {
		if err == mgo.ErrNotFound {
			log.Println("Dialogue is not found")
			err = coll.Insert(bson.M{"userid": bson.ObjectIdHex(req.FormValue("user_id")),
				"interlocutorid": bson.ObjectIdHex(req.FormValue("friend_id")),
				"message_id":     bson.ObjectIdHex("000000000000000000000000")})
			if err != nil {
				http.Error(rw, err.Error(), 500)
				return
			}
			err = coll.Insert(bson.M{"userid": bson.ObjectIdHex(req.FormValue("friend_id")),
				"interlocutorid": bson.ObjectIdHex(req.FormValue("user_id")),
				"message_id":     bson.ObjectIdHex("000000000000000000000000")})
			if err != nil {
				http.Error(rw, err.Error(), 500)
				return
			}
			ad.MessageID = "000000000000000000000000"
			jsonResponse, err := json.Marshal(ad)
			if err != nil {
				http.Error(rw, err.Error(), 500)
			}
			rw.Write(jsonResponse)
			return
		}
		http.Error(rw, err.Error(), 500)
		return
	}
	log.Println("Dialogue is found")
	log.Println(ad)

	log.Println(4)

	jsonResponse, err := json.Marshal(ad)
	if err != nil {
		http.Error(rw, err.Error(), 500)
	}
	log.Println(jsonResponse)
	rw.Write(jsonResponse)
}

func (c *Context) logout(rw web.ResponseWriter, req *web.Request) {
	log.Println("logout function was called")
	reqBytes, err := ioutil.ReadAll(req.Body)
	if err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
	}
	var jsonObject struct {
		Token  string `json:"token"`
		UserID string `json:"user_id"`
	}
	json.Unmarshal(reqBytes, &jsonObject)

	coll := db.C("sessions")
	err = coll.Remove(bson.M{
		"token":  jsonObject.Token,
		"userid": bson.ObjectIdHex(jsonObject.UserID)})
	if err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
	}
}

func (c *Context) register(rw web.ResponseWriter, req *web.Request) {
	log.Println("register function was called")

	reqBytes, err := ioutil.ReadAll(req.Body)
	if err != nil {
		rw.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintln(rw, err.Error())
		return
	}
	var jsonObject struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}
	json.Unmarshal(reqBytes, &jsonObject)

	var jsonResponse []byte

	hash, err := bcrypt.GenerateFromPassword([]byte(jsonObject.Password), 8)
	if err != nil {
		jsonResponse, _ = json.Marshal(struct {
			Error string `json:"error"`
		}{err.Error()})
		rw.Write(jsonResponse)
		return
	}

	user := User{
		ID:             bson.NewObjectId(),
		Login:          jsonObject.Login,
		HashedPassword: string(hash),
		FirstName:      jsonObject.Login,
		SecondName:     "",
		Date:           time.Now(),
		Avatar:         "",
		IsActive:       true}
	col := db.C("users")
	err = col.Insert(user)
	if err != nil {
		jsonResponse, _ = json.Marshal(struct {
			Error string `json:"error"`
		}{err.Error()})
		rw.Write(jsonResponse)
		return
	}

	jsonResponse, _ = json.Marshal(struct {
		Message string `json:"message"`
	}{"Registration successful"})
	rw.Write(jsonResponse)
	return
}

func (c *Context) changePassword(rw web.ResponseWriter, req *web.Request) {
	log.Println("changePassword function was called")
	reqBytes, err := ioutil.ReadAll(req.Body)
	if err != nil {
		rw.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintln(rw, err.Error())
		return
	}
	var jsonObject struct {
		ID          string `json:"user_id"`
		Password    string `json:"password"`
		NewPassword string `json:"new_password"`
	}
	json.Unmarshal(reqBytes, &jsonObject)

	var user User
	coll := db.C("users")
	err = coll.FindId(bson.ObjectIdHex(jsonObject.ID)).One(&user)
	if err != nil {
		log.Println("Can't find user")
		rw.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintln(rw, err.Error())
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.HashedPassword), []byte(jsonObject.Password))
	if err != nil {
		log.Println("wrong password")
		rw.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintln(rw, err.Error())
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(jsonObject.NewPassword), 8)
	if err != nil {
		log.Println("Can't generate")
		rw.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintln(rw, err.Error())
		return
	}

	err = coll.Update(bson.M{"_id": bson.ObjectIdHex(jsonObject.ID)}, bson.M{
		"$set": bson.M{
			"hashed_password": hash}})
	if err != nil {
		log.Println("Can't update")
		rw.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintln(rw, err.Error())
		return
	}

	log.Println("end")
	rw.WriteHeader(200)
	fmt.Fprintln(rw, "Password is changed")
}

func (c *Context) changeName(rw web.ResponseWriter, req *web.Request) {
	log.Println("changeName function was called")

	var user User
	coll := db.C("users")
	err := coll.FindId(bson.ObjectIdHex(req.FormValue("user_id"))).One(&user)
	if err != nil {
		log.Println("Can't find user")
		rw.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintln(rw, err.Error())
		return
	}

	err = coll.Update(bson.M{"_id": bson.ObjectIdHex(req.FormValue("user_id"))}, bson.M{
		"$set": bson.M{
			"firstname":  req.FormValue("first_name"),
			"secondname": req.FormValue("last_name")}})
	if err != nil {
		log.Println("Can't update")
		rw.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintln(rw, err.Error())
		return
	}

	log.Println("end")
	rw.WriteHeader(200)
	fmt.Fprintln(rw, "Name is changed")
}

func (*Context) checkNew(rw web.ResponseWriter, req *web.Request) {
	log.Printf("checkNew function was called\n")
	reqBytes, err := ioutil.ReadAll(req.Body)
	if err != nil {
		fmt.Println("Не повезло...")
	}
	var jsonObject struct {
		MessageID string `json:"message_id"`
	}

	json.Unmarshal(reqBytes, &jsonObject)

	coll := db.C("messages")
	var message Message
	var jsonResponse []byte
	err = coll.Find(bson.M{"parentmessageid": jsonObject.MessageID}).One(&message)
	if err != nil {
		jsonResponse, err = json.Marshal(struct {
			Message string `json:"message"`
		}{"Error"})
		if err != nil {
			fmt.Println("can't be marshalised")
		}
	} else {
		jsonResponse, err = json.Marshal(message)
		if err != nil {
			fmt.Println("can't be marshalised")
		}
	}

	rw.Write(jsonResponse)
}
