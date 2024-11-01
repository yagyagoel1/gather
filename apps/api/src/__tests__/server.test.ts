import supertest from "supertest";
import { describe, it, expect, afterAll, beforeAll } from "@jest/globals";
import { createServer } from "../server";
import prisma from "@repo/db"
async function cleanData(){
  

  await prisma.mapElements.deleteMany();
  await prisma.spaceElements.deleteMany();
  await prisma.element.deleteMany(); 
  await prisma.space.deleteMany();    
  await prisma.avatar.deleteMany();   
  await prisma.map.deleteMany();      
  
  await prisma.user.deleteMany();    
   

}
afterAll(async () => {
  await cleanData();
  })
beforeAll(async () => {
  await cleanData();
  }
)
describe("Auth", () => {
  afterAll(async () => {
    await cleanData();
    })
  it("signup should return 200", async () => {
  const res=   await supertest(createServer())
      .post("/api/v1/signup").send({
        "username": "harkirat",
        "password": "123random",
        "type": "admin"
      })
      
        expect(res.body).toHaveProperty("userId");
  });

  it("signin should be 200", async () => {
   const res =  await supertest(createServer()).post("/api/v1/signin").send(
        {
          "username": "harkirat",
          "password": "123random"
        })
      
        expect(res.body).toHaveProperty("token");
    
  });
  it ("signin should return 400", async () => {
    const res = await supertest(createServer
    ())
      .post("/api/v1/signin").send(
        {
          "username": "harkirat",
          "password": "123rando",}
    )
    expect(res.statusCode).toBe(400);
})

});



describe("space dashboard", () => {
  let token:string;
  let spaceId:string;
  let elementId:string;
  let mapId:string;
  let spaceElementId:string;
  afterAll(async () => {
    await cleanData();
    })
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
  it("create a new element should return 200", async () => {
    const response = await supertest(createServer())
      .post(`/api/v1/admin/element`).set("Authorization", `Bearer ${token}`).send({
        "width": 1,
        "height": 1,
        "staticc": true,
        "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"
      })
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id");
    elementId = response.body.id;
  })
  it("create a map should return 200", async () => {
    const response = await supertest(createServer())
      .post(`/api/v1/admin/map`).set("Authorization", `Bearer ${token}`).send({
        "thumbnail": "https://thumbnail.com/a.png",
        "dimensions": "100x200",
        "name": "map1",
        "defaultElements": [{
            elementId: elementId,
            x: 21,
            y: 20
          }, {
            elementId: elementId,
            x: 18,
            y: 50
          }, {
            elementId: elementId,
            x: 19,
            y: 80
          }
        ]
     })
    expect(response.statusCode).toBe(200);
    
     mapId = response.body.mapId
  })
  it("space dashboard should return 200", async () => {
   const response= await supertest(createServer())
      .post("/api/v1/space").set("Authorization", `Bearer ${token}`).send({
        "name": "Test",
        "dimensions": "100x200",
        "mapId": mapId,
        "thumbnail":"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"
     })    
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("spaceId");
    spaceId = response.body.spaceId;
  })
  it("space dashboard should return 400", async () => {
    const response = await supertest(createServer())
      .post("/api/v1/space").set("Authorization", `Bearer ${token}`).send({
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
    const response= await supertest(createServer())
       .post("/api/v1/space").set("Authorization", `Bearer ${token}`).send({
         "name": "Test",
         "dimensions": "100x200",
         "mapId": mapId,
         "thumbnail":"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"
      })    
       expect(response.statusCode).toBe(200);
       expect(response.body).toHaveProperty("spaceId");
     spaceId = response.body.spaceId;
    });
  it("get all existing spaces should return 200", async () => {
    const response = await supertest(createServer())
      .get("/api/v1/space/all").set("Authorization", `Bearer ${token}`)
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
    expect(response.body.elements).toHaveLength(3);
  })
  it("update an element should return 200", async () => {//doubt about id(as admin is  creating id cant be chair1) and  (the width and height of the element is defined by admin)
    const response = await supertest(createServer())
      .post(`/api/v1/space/element`).set("Authorization", `Bearer ${token}`).send({
        "elementId": elementId,
        "spaceId": spaceId,
        "x": 52,
        "y": 21
      })
    expect(response.statusCode).toBe(200);
  })
  it("update an element should return 400", async () => {
    const response = await supertest(createServer())
      .post(`/api/v1/space/element`).set("Authorization", `Bearer ${token}`).send({
        "elementId": "chair2",
        "spaceId": spaceId,
        "x": 1,
        "y": 13
      })
    expect(response.statusCode).toBe(400);
  })
  it("update another element for deleting should return 200", async () => {
    const response = await supertest(createServer())
      .post(`/api/v1/space/element`).set("Authorization", `Bearer ${token}`).send({
        "elementId": elementId,
        "spaceId": spaceId,
        "x": 60,
        "y": 30
      })
    expect(response.statusCode).toBe(200);
    spaceElementId = response.body.elementId;
  })
  it("delete an element should return 200", async () => {
    const response = await supertest(createServer())
      .delete(`/api/v1/space/element/${spaceElementId}`).set("Authorization", `Bearer ${token}`)
      .send({
        "spaceId": spaceId
      })
    expect(response.statusCode).toBe(200);
  })
  it("delete an element should return 400", async () => {
    const response = await supertest(createServer())
      .delete(`/api/v1/space/element/chair2`).set("Authorization", `Bearer ${token}`)
      .send({
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
    expect(response.body.elements).toHaveLength(4);
    expect(response.body.elements[0]).toHaveProperty("id");
    expect(response.body.elements[0]).toHaveProperty("x");
    expect(response.body.elements[0]).toHaveProperty("y");
    expect(response.body.elements[0]).toHaveProperty("imageUrl");
  })
})

describe("admin creator endpoint", () => {
  afterAll(async () => {
    await cleanData();
    })
  let token:string;
  let elementId:string;
  let avatarId:string;
  let userId:string;
  beforeAll(async () => {
 const   response =await supertest(createServer())
      .post("/api/v1/signup")
      .send({
        username: "harkirat",
        password: "123random",
        type: "admin"
      });
userId = response.body.userId;
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
      .post(`/api/v1/admin/element`).set("Authorization", `Bearer ${token}`).send({
        "width": 1,
        "height": 1,
        "staticc": true,
        "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"
      })
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id");
    elementId = response.body.id;
  })
  it("updating the image of an element should return 200", async () => {
    const response = await supertest(createServer())
      .put(`/api/v1/admin/element/${elementId}`).set("Authorization", `Bearer ${token}`).send({
        
        "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"
      })
    expect(response.statusCode).toBe(200);
  })
  it("creating an avatar should return 200", async () => {
    const response = await supertest(createServer())
      .post(`/api/v1/admin/avatar`).set("Authorization", `Bearer ${token}`).send({
        "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        "name":"Timmy"
      })
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("avatarId");
    avatarId = response.body.avatarId;
  })
  it("create a map should return 200", async () => {
    const response = await supertest(createServer())
      .post(`/api/v1/admin/map`).set("Authorization", `Bearer ${token}`).send({
        "thumbnail": "https://thumbnail.com/a.png",
        "dimensions": "100x200",
        "name": "map1",
        "defaultElements": [{
            elementId: elementId,
            x: 21,
            y: 20
          }, {
            elementId: elementId,
            x: 18,
            y: 50
          }, {
            elementId: elementId,
            x: 19,
            y: 80
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
      .get(`/api/v1/avatar`).set("Authorization", `Bearer ${token}`)
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("avatars");
    expect(response.body.avatars).toHaveLength(1);
    expect(response.body.avatars[0]).toHaveProperty("id");
    expect(response.body.avatars[0]).toHaveProperty("imageUrl");
  })
  it("get other user meta data should return 200", async () => {
    const response = await supertest(createServer())
      .get(`/api/v1/user/metadata/bulk?ids=[${userId}]`).set("Authorization", `Bearer ${token}`)
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("avatars");
    expect(response.body.avatars).toHaveLength(1);
    expect(response.body.avatars[0]).toHaveProperty("userId");
    expect(response.body.avatars[0]).toHaveProperty("imageUrl");
  })
  })