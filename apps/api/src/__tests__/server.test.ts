import supertest from "supertest";
import { describe, it, expect, afterAll, beforeAll } from "@jest/globals";
import { createServer } from "../server";

function cleanData(){
  // Clean data before running tests
}
describe("Auth", () => {
  it("signup should return 200", async () => {
    await supertest(createServer())
      .get("/api/v1/signup").send({
        "username": "harkirat",
        "password": "123random",
        "type": "admin"
      })
      .expect(200)
      .then((res) => {
        expect(res.body).toBe({userId:"1"});
      });
  });

  it("signin should be 200", async () => {
    await supertest(createServer())
      .post("/api/v1/signin").send(
        {
          "username": "harkirat",
          "password": "123random"
        })
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("token");
      });
  });
  it ("signin should return 400", async () => {
    const res = await supertest(createServer
    ())
      .post("/api/v1/signin").send(
        {
          "username": "harkirat",
          "password": "123rando",}
    )
    expect(res.statusCode).toBe(403);
})
afterAll(() => {
cleanData();
})
});

describe("User information", () => {
  let token:string;

  beforeAll(async () => {
    await supertest(createServer())
      .post("/api/v1/signup")
      .send({
        username: "harkirat",
        password: "123random",
        type: "admin"
      });

    const signinResponse = await supertest(createServer())
      .post("/api/v1/signin")
      .send({
        username: "harkirat",
        password: "123random"
      });

    token = signinResponse.body.token;
  });
  it("user metadata should return 200", async () => {
  const response=  await supertest(createServer())
      .get("/api/v1/user/metadata")
      .set("Authorization", `Bearer ${token}`).send({"avatarId": "123"})
     expect(response.statusCode).toBe(200);
  })

})


describe("space dashboard", () => {
  let token:string;
  let spaceId:string;
  beforeAll(async () => {
    await supertest(createServer())
      .post("/api/v1/signup")
      .send({
        username: "harkirat",
        password: "123random",
        type: "admin"
      });

    const signinResponse = await supertest(createServer())
      .post("/api/v1/signin")
      .send({
        username: "harkirat",
        password: "123random"
      });

    token = signinResponse.body.token;
  });
  it("space dashboard should return 200", async () => {
   const response= await supertest(createServer())
      .get("/api/v1/space").set("Authorization", `Bearer ${token}`).send({
        "name": "Test",
        "dimensions": "100x200",
        "mapId": "map1"
     })    
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("spaceId");
    spaceId = response.body.spaceId;
  })
  it("space dashboard should return 400", async () => {
    const response = await supertest(createServer())
      .get("/api/v1/space").set("Authorization", `Bearer ${token}`).send({
        "name": "Test",
        "dimensions": "100x200",
        "mapId": "map1"
      })
    expect(response.statusCode).toBe(400);
  })
  it("delete a space should return 200", async () => {
    const response = await supertest(createServer())
      .delete(`/api/v1/space/${spaceId}`).set("Authorization", `Bearer ${token}`)
    expect(response.statusCode).toBe(200);
  })
  it("space dashboard should return 200", async () => {
    const response = await supertest(createServer())
      .get("/api/v1/space").set("Authorization", `Bearer ${token}`).send({
        "name": "Test",
        "dimensions": "100x200",
        "mapId": "map1"
      })
    expect(response.statusCode).toBe(200);
  })
  it("get all existing spaces should return 200", async () => {
    const response = await supertest(createServer())
      .get("/api/v1/space").set("Authorization", `Bearer ${token}`)
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("spaces");
    expect(response.body.spaces).toHaveLength(1);
  })
  it("get a space should return 200", async () => {
    const response = await supertest(createServer())
      .get(`/api/v1/space/${spaceId}`).set("Authorization", `Bearer ${token}`)
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("dimensions");
    expect(response.body).toHaveProperty("elements");
    expect(response.body.elements).toHaveLength(0);
  })
  it("update an element should return 200", async () => {//doubt about id(as admin is  creating id cant be chair1) and  (the width and height of the element is defined by admin)
    const response = await supertest(createServer())
      .post(`/api/v1/space/element`).set("Authorization", `Bearer ${token}`).send({
        "elementId": "chair1",
        "spaceId": spaceId,
        "x": 50,
        "y": 20
      })
    expect(response.statusCode).toBe(200);
  })
  it("update an element should return 400", async () => {
    const response = await supertest(createServer())
      .post(`/api/v1/space/element`).set("Authorization", `Bearer ${token}`).send({
        "elementId": "chair1",
        "spaceId": spaceId,
        "x": 50,
        "y": 20
      })
    expect(response.statusCode).toBe(400);
  })
  it("update another element for deleting should return 200", async () => {
    const response = await supertest(createServer())
      .post(`/api/v1/space/element`).set("Authorization", `Bearer ${token}`).send({
        "elementId": "chair2",
        "spaceId": spaceId,
        "x": 60,
        "y": 20
      })
    expect(response.statusCode).toBe(200);
  })
  it("delete an element should return 200", async () => {
    const response = await supertest(createServer())
      .delete(`/api/v1/space/element`).set("Authorization", `Bearer ${token}`)
      .send({
        "elementId": "chair2",
        "spaceId": spaceId
      })
    expect(response.statusCode).toBe(200);
  })
  it("delete an element should return 400", async () => {
    const response = await supertest(createServer())
      .delete(`/api/v1/space/element`).set("Authorization", `Bearer ${token}`)
      .send({
        "elementId": "chair2",
        "spaceId": spaceId
      })
    expect(response.statusCode).toBe(400);
  })
  it("get all the elements in a space should return 200", async () => {
    const response = await supertest(createServer())
      .get(`/api/v1/space/elements`).set("Authorization", `Bearer ${token}`).send({
        "spaceId": spaceId,
      })
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("elements");
    expect(response.body.elements).toHaveLength(1);
    expect(response.body.elements[0]).toHaveProperty("id");
    expect(response.body.elements[0]).toHaveProperty("x");
    expect(response.body.elements[0]).toHaveProperty("y");
    expect(response.body.elements[0]).toHaveProperty("imageUrl");
  })
})

describe("admin creator endpoint", () => {
  let token:string;
  let elementId:string;
  let avatarId:string;
  beforeAll(async () => {
    await supertest(createServer())
      .post("/api/v1/signup")
      .send({
        username: "harkirat",
        password: "123random",
        type: "admin"
      });

    const signinResponse = await supertest(createServer())
      .post("/api/v1/signin")
      .send({
        username: "harkirat",
        password: "123random"
      });

    token = signinResponse.body.token;
  })

  it("create a new element should return 200", async () => {
    const response = await supertest(createServer())
      .post(`/api/v1/element`).set("Authorization", `Bearer ${token}`).send({
        "width": 1,
        "height": 1,
        "static": true,
        "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"
      })
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("elementId");
    elementId = response.body.elementId;
  })
  it("updating the image of an element should return 200", async () => {
    const response = await supertest(createServer())
      .put(`/api/v1/element/${elementId}`).set("Authorization", `Bearer ${token}`).send({
        
        "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"
      })
    expect(response.statusCode).toBe(200);
  })
  it("creating an avatar should return 200", async () => {
    const response = await supertest(createServer())
      .post(`/api/v1/avatar`).set("Authorization", `Bearer ${token}`).send({
        "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        "name":"Timmy"
      })
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("avatarId");
    avatarId = response.body.avatarId;
  })
  it("create a map should return 200", async () => {
    const response = await supertest(createServer())
      .post(`/api/v1/map`).set("Authorization", `Bearer ${token}`).send({
        "thumbnail": "https://thumbnail.com/a.png",
        "dimensions": "100x200",
        "defaultElements": [{
            elementId: "chair1",
            x: 20,
            y: 20
          }, {
            elementId: "chair2",
            x: 18,
            y: 20
          }, {
            elementId: "table1",
            x: 19,
            y: 20
          }, {
            elementId: "table2",
            x: 19,
            y: 20
          }
        ]
     })
    expect(response.statusCode).toBe(200);
  })
  it("post update a user avatar should return 200", async () => {
    const response = await supertest(createServer())
      .post(`/api/v1/user/metadata`).set("Authorization", `Bearer ${token}`).send({
        "avatarId": avatarId
      })
    expect(response.statusCode).toBe(200);
  })
  it("get all avatars should return 200", async () => {
    const response = await supertest(createServer())
      .get(`/api/v1/avatars`).set("Authorization", `Bearer ${token}`)
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("avatars");
    expect(response.body.avatars).toHaveLength(1);
    expect(response.body.avatars[0]).toHaveProperty("id");
    expect(response.body.avatars[0]).toHaveProperty("imageUrl");
  })
  it("get other user meta data should return 200", async () => {
    const response = await supertest(createServer())
      .get(`/api/v1/user/metadata/bulk?ids=[1, 3, 55]`).set("Authorization", `Bearer ${token}`)
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("avatars");
    expect(response.body.avatars).toHaveLength(3);
    expect(response.body.avatars[0]).toHaveProperty("userId");
    expect(response.body.avatars[0]).toHaveProperty("imageUrl");
  })
  })