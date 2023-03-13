const transportAPI = require('../src/index');

(async () => {
    const res = await transportAPI.GetVehicleInformationEnglish("OBX182");
    console.log(res);
})();
