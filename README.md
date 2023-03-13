# Transport NodeJS API Wrapper
NodeJS API wrapper/scraper for swedish Transport's service (Vehicle Details). 

```
import * as api from "transport-api";

(async () => {
    console.log("fetching vehicle info");
    var res = await api.GetVehicleInformationEnglish("JWZ148");

    console.log(res);
})();

```

