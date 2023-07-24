fetch('http://localhost:5678/api/works')
		.then(r =>  r.json()) 
		.then(body => console.log(body))

		fetch('http://localhost:5678/api/categories') 
			.then(a =>  a.json()) 
		.then(body => console.log(body))