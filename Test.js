let t = new Template()
t.load("hello", "hello.html").then(e=>{
    e.begin('#dom', e.parse("hello", {
        name: "小明",
        id: 123456789
    }))
})

