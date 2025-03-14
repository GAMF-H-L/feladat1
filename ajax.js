document.getElementById('fetchDataBtn').addEventListener('click', function() {
    // A "read" művelet indítása
    const op = 'read';
    fetchData(op)
        .then(data => {
            if (data && data.list) {
                const tableBody = document.querySelector('#dataTable tbody');
                tableBody.innerHTML = ''; // Előző adatok törlése

                // A lista adatai megjelenítése a táblázatban
                data.list.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.id}</td>
                        <td>${item.name}</td>
                        <td>${item.height}</td>
                        <td>${item.weight}</td>
                    `;
                    tableBody.appendChild(row);
                });

                // Statisztikai információk megjelenítése
                const heightData = data.list.map(item => parseInt(item.height, 10));
                const sum = heightData.reduce((acc, curr) => acc + curr, 0);
                const avg = sum / heightData.length;
                const max = Math.max(...heightData);


                // Kiírás a táblázatba
                document.getElementById('sumValue').textContent = sum;
                document.getElementById('avgValue').textContent = avg.toFixed(2);
                document.getElementById('maxValue').textContent = max;

                //console.log('Összeg:', sum);
                //console.log('Átlag:', avg);
                //console.log('Legnagyobb:', max);
            } else {
                console.error('Nem érkeztek adatok!');
            }
        })
        .catch(error => {
            console.error('Hiba történt az adatlekérés során:', error);
        });
});

function fetchData(op, data = {}) {
    const url = 'http://gamf.nhely.hu/ajax2/'; // API endpoint
    const code = 'F7OTB7hal024'; // A saját Neptun kódod

    let requestData = {
        op: op,
        code: code,
        ...data // ha van új adat, hozzáadjuk
    };

    // Formázás URL-kódolással
    const formData = new URLSearchParams(requestData).toString();

    // A fetch hívás, hogy adatokat kérjünk az API-tól
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('API hiba: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log('API válasz:', data);
        return data;
    })
    .catch(error => {
        console.error('Fetch hiba:', error);
        throw error; // Továbbadjuk a hibát
    });
}

document.getElementById('addDataForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const newData = {
        name: document.getElementById('name').value,
        height: document.getElementById('height').value,
        weight: document.getElementById('weight').value
    };

    addData(newData);
});
//hozzáadás
function addData(data) {
    const op = 'create'; // A művelet típusának beállítása
    fetchData(op, data)
        .then(response => {
            // Ellenőrizzük a backend válaszát
            if (response && response.success === true || response == 1) {
                alert('Új adat hozzáadva!');
                fetchData('read') // Frissítjük az adatokat
                    .then(updatedData => {
                        // A táblázat frissítése az új adatokkal
                        const tableBody = document.querySelector('#dataTable tbody');
                        tableBody.innerHTML = ''; // Táblázat törlése
                        updatedData.list.forEach(item => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${item.id}</td>
                                <td>${item.name}</td>
                                <td>${item.height}</td>
                                <td>${item.weight}</td>
                            `;
                            tableBody.appendChild(row);
                        });
                    });
            } else {
                // Ha nem sikerült, vagy nincs valid válasz, hibát jelenítünk meg
                console.error('Hiba történt az adat hozzáadása során:');
                alert('Hiba történt az adat hozzáadása során! ' + (response ? response.message : 'Ismeretlen hiba'));
            }
        })
        .catch(error => {
            console.error('Hiba történt:', error);
            alert('Hiba történt az adat hozzáadása során!');
        });
}
//lekérés
document.getElementById('getDataForIdBtn').addEventListener('click', function() {
    const id = parseInt(document.getElementById('updateId').value.trim(), 10); // Stringből számmá alakítás
    if (!isNaN(id)) { // Csak akkor folytassuk, ha érvényes szám
        const op = 'read';
        fetchData(op, { id })
            .then(data => {
                console.log("Visszakapott adatok:", data);
                console.log("Lekérdezett ID:", id);

                if (data && data.list && data.list.length > 0) {
                    const item = data.list.find(item => Number(item.id) === id); // Biztosítjuk, hogy mindkettő number

                    if (item) {
                        document.getElementById('updateName').value = item.name;
                        document.getElementById('updateHeight').value = item.height;
                        document.getElementById('updateWeight').value = item.weight;
                    } else {
                        alert('Nincs ilyen ID az adatok között!');
                    }
                } else {
                    alert('Nincs ilyen ID!');
                }
            })
            .catch(error => {
                console.error('Hiba történt az adat betöltésében:', error);
            });
    } else {
        alert('Érvénytelen ID!');
    }
});
//frissítés
document.getElementById('updateDataForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Megakadályozza az oldal újratöltését

    const id = parseInt(document.getElementById('updateId').value.trim(), 10);
    const name = document.getElementById('updateName').value.trim();
    const height = document.getElementById('updateHeight').value.trim();
    const weight = document.getElementById('updateWeight').value.trim();
    const code = "F7OTB7hal024"; // A saját azonosító kódod

    if (!isNaN(id) && name && height && weight) { // Ellenőrzés: minden mező kitöltve?
        const op = 'update';
        fetchData(op, { id, name, height, weight, code })
            .then(response => {
                if (response && response.rowCount != 1) {
                    alert('Adatok sikeresen frissítve!');
                } else {
                    alert('Hiba történt a frissítés során!');
                }
            })

    } else {
        alert('Minden mezőt ki kell tölteni!');
    }
});

//törlés
document.getElementById('deleteDataForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Megakadályozza a form alapértelmezett elküldését

    const id = document.getElementById('deleteId').value.trim();
    const code = 'F7OTB7hal024'; // Itt add meg a kódodat

    if (id) {
        // API kérés paraméterek
        const op = 'delete';

        // Lekérdezés az API-ra
        fetch('http://gamf.nhely.hu/ajax2/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                op: op,
                id: id,
                code: code
            })
        })
        .then(response => response.json()) // A válasz JSON-ba konvertálása
        .then(data => {
            // Naplózzuk a választ, hogy lássuk, mi történik
            console.log('Válasz:', data);
            
            if (data && data.rowCount > 0 || data == 1) {
                alert('Adat sikeresen törölve!');
                // Ha sikerült, ürítjük a mezőt
                document.getElementById('deleteId').value = '';
            } else {
                alert('Nem történt változtatás. Lehet, hogy nem létezik ilyen ID vagy nincs hozzáférés.');
            }
        })
        .catch(error => {
            console.error('Hiba történt a törlés során:', error);
            alert('Hiba történt a törlés során!');
        });
    } else {
        alert('Kérjük, adja meg az ID-t!');
    }
});

