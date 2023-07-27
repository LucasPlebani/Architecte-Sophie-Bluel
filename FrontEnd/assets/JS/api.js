// apport des api Catégories / works //
export async function getDatabaseInfo(type){
	const response  = await fetch(`http://localhost:5678/api/${type}`)
	if (response.ok) {
		return response.json()
	} else {
		console.log(response);
		return false;
	}
}
