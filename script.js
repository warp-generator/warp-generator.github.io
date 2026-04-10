const AWGm1 = document.getElementById('generateButton1');
const AWGm2 = document.getElementById('generateButton2');
const AWGm3 = document.getElementById('generateButton3');
const Clash = document.getElementById('generateButton4');
const WireSock = document.getElementById('generateButton5');
const container = document.querySelector('.container');

function generateRandomEndpoint() {
    const ports = [500, 854, 859, 864, 878, 880, 890, 891, 894, 903, 908, 928, 934, 939, 942, 943, 945, 946, 955, 968, 987, 988, 1002, 1010, 1014, 1018, 1070, 1074, 1180, 1387, 1701, 1843, 2371, 2408, 2506, 3138, 3476, 3581, 3854, 4177, 4198, 4233, 4500, 5279, 5956, 7103, 7152, 7156, 7281, 7559, 8319, 8742, 8854, 8886];
    
    const selectedServer = getSelectedServer();
    let port = ports[Math.floor(Math.random() * ports.length)];

    if (selectedServer === 'def') {
        const prefixes = ["162.159.192.", "162.159.195.", "engage.cloudflareclient.com"];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        
        if (prefix === "engage.cloudflareclient.com") {
            return `${prefix}:${port}`;
        } else {
            const randomNumber = Math.floor(Math.random() * 10) + 1;
            return `${prefix}${randomNumber}:${port}`;
        }
    }

    const serverMap = {
		'PL': 'pl.tribukvy.ltd',     // Польша  
		'DE': 'de.tribukvy.ltd',     // Германия -
		'RU': 'ru0.tribukvy.ltd',    // Россия
		'EE': 'ee.tribukvy.ltd',     // Эстония 
        'NL': 'nl.tribukvy.ltd',  	 // Нидерланды
        'FL': 'fi1.tribukvy.ltd',  	 // Финляндия
		'US': 'usa.tribukvy.ltd'  	 // США
    };
    
    const endpoint = serverMap[selectedServer] || 'pl.tribukvy.ltd';
    return `${endpoint}:${port}`;
}

function getSelectedServer() {
    const serverRadios = document.getElementsByName('server');
    for (let radio of serverRadios) {
        if (radio.checked) {
            return radio.id;
        }
    }
    return 'def'; // По умолчанию стандартный
}

// Функция для получения префикса названия конфига
function getConfigPrefix() {
    const selectedServer = getSelectedServer();
    const selectedDNS = getSelectedDNSRadio();
    
    const standardDNS = ['cf', 'google'];
    if (selectedServer === 'def' && standardDNS.includes(selectedDNS)) {
        return '';
    }
    
    const serverPrefixMap = {
        'PL': 'pl',
        'DE': 'de',
        'RU': 'ru',
        'EE': 'ee',
        'NL': 'nl',
        'FL': 'fl',
        'US': 'us'
    };
    
    const dnsPrefixMap = {
        'malw': 'mlw',
        'xbox': 'xbx',
        'geohide': 'ghd',
        'comss': 'cms'
    };
    
    let prefix = '';
    
    if (selectedServer !== 'def' && serverPrefixMap[selectedServer]) {
        prefix += serverPrefixMap[selectedServer];
    }
    
    if (!standardDNS.includes(selectedDNS) && dnsPrefixMap[selectedDNS]) {
        prefix += dnsPrefixMap[selectedDNS];
    }
    
    return prefix;
}

function getConfigFilename(baseName, randomNumber) {
    const prefix = getConfigPrefix();
    if (prefix) {
        return `${prefix}${baseName}_${randomNumber}.conf`;
    }
    return `${baseName}_${randomNumber}.conf`;
}

const fetchWithTimeout = async (url, options = {}, timeout = 3000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error(`Request timeout for ${url}`);
        }
        throw error;
    }
};

const sessionCache = {
    config: null,
    timestamp: null
};

const fetchFullConfig = async () => {
    if (sessionCache.config) {
        console.log('Using cached config');
        return sessionCache.config;
    }
    
    const endpoints = [
        'https://www.warp-generator.workers.dev',				// 0
        'https://warp.sub-aggregator.workers.dev',				// 1
		'https://warp-vercel-murex.vercel.app/api/warp-data',	// 2
		'https://warp-vercel-chi.vercel.app/api/warp-data'		// 3
    ];
    
    let lastError;
    
    for (let i = 0; i < endpoints.length; i++) {
        try {
            console.log(`Trying config endpoint: ${i}`);
            const response = await fetchWithTimeout(endpoints[i]);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch config from ${i}: ${response.status}`);
            }
            
            const configData = await response.json();
            
            // Сохраняем в кэш
            sessionCache.config = configData;
            
            return configData;
        } catch (error) {
            console.warn(`Failed to fetch from ${i}:`, error.message);
            lastError = error;
            
            if (i === endpoints.length - 1) {
                throw lastError;
            }
        }
    }
    
    throw lastError;
};

// Popup notification
const showPopup = (message, type = 'success') => {
    const popup = document.createElement('div');
    popup.className = 'popup-message';
    popup.innerHTML = message;
    
    if (type === 'error') {
        popup.style.backgroundColor = '#d32f2f';
		popup.style.textAlign = 'center';
    }
    
    document.body.appendChild(popup);
    setTimeout(() => {
        if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    }, 2500);
};

const downloadConfig = (fileName, content) => {

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'application/octet-stream' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
	
};

// AWGm1
AWGm1.addEventListener('click', async () => {
	const button = document.getElementById('generateButton1');
    const status = document.getElementById('status');
	const randomEndpoint = generateRandomEndpoint();
	const randomNumber = Math.floor(Math.random() * (99 - 10 + 1)) + 10;
    button.disabled = true;
    button.classList.add("button--loading");
    try {
		const configData = await fetchFullConfig();
		const selectedDNS = getSelectedDNS();
		const i1Toggle = document.getElementById('i1toggle');
		const i2area = document.getElementById('i2');
		let i1Value = '';
		if (i1Toggle.checked && i2area.value.trim()) {i1Value = i2area.value.trim()} else {i1Value = 'I1 = <b 0xce000000010897a297ecc34cd6dd000044d0ec2e2e1ea2991f467ace4222129b5a098823784694b4897b9986ae0b7280135fa85e196d9ad980b150122129ce2a9379531b0fd3e871ca5fdb883c369832f730e272d7b8b74f393f9f0fa43f11e510ecb2219a52984410c204cf875585340c62238e14ad04dff382f2c200e0ee22fe743b9c6b8b043121c5710ec289f471c91ee414fca8b8be8419ae8ce7ffc53837f6ade262891895f3f4cecd31bc93ac5599e18e4f01b472362b8056c3172b513051f8322d1062997ef4a383b01706598d08d48c221d30e74c7ce000cdad36b706b1bf9b0607c32ec4b3203a4ee21ab64df336212b9758280803fcab14933b0e7ee1e04a7becce3e2633f4852585c567894a5f9efe9706a151b615856647e8b7dba69ab357b3982f554549bef9256111b2d67afde0b496f16962d4957ff654232aa9e845b61463908309cfd9de0a6abf5f425f577d7e5f6440652aa8da5f73588e82e9470f3b21b27b28c649506ae1a7f5f15b876f56abc4615f49911549b9bb39dd804fde182bd2dcec0c33bad9b138ca07d4a4a1650a2c2686acea05727e2a78962a840ae428f55627516e73c83dd8893b02358e81b524b4d99fda6df52b3a8d7a5291326e7ac9d773c5b43b8444554ef5aea104a738ed650aa979674bbed38da58ac29d87c29d387d80b526065baeb073ce65f075ccb56e47533aef357dceaa8293a523c5f6f790be90e4731123d3c6152a70576e90b4ab5bc5ead01576c68ab633ff7d36dcde2a0b2c68897e1acfc4d6483aaaeb635dd63c96b2b6a7a2bfe042f6aed82e5363aa850aace12ee3b1a93f30d8ab9537df483152a5527faca21efc9981b304f11fc95336f5b9637b174c5a0659e2b22e159a9fed4b8e93047371175b1d6d9cc8ab745f3b2281537d1c75fb9451871864efa5d184c38c185fd203de206751b92620f7c369e031d2041e152040920ac2c5ab5340bfc9d0561176abf10a147287ea90758575ac6a9f5ac9f390d0d5b23ee12af583383d994e22c0cf42383834bcd3ada1b3825a0664d8f3fb678261d57601ddf94a8a68a7c273a18c08aa99c7ad8c6c42eab67718843597ec9930457359dfdfbce024afc2dcf9348579a57d8d3490b2fa99f278f1c37d87dad9b221acd575192ffae1784f8e60ec7cee4068b6b988f0433d96d6a1b1865f4e155e9fe020279f434f3bf1bd117b717b92f6cd1cc9bea7d45978bcc3f24bda631a36910110a6ec06da35f8966c9279d130347594f13e9e07514fa370754d1424c0a1545c5070ef9fb2acd14233e8a50bfc5978b5bdf8bc1714731f798d21e2004117c61f2989dd44f0cf027b27d4019e81ed4b5c31db347c4a3a4d85048d7093cf16753d7b0d15e078f5c7a5205dc2f87e330a1f716738dce1c6180e9d02869b5546f1c4d2748f8c90d9693cba4e0079297d22fd61402dea32ff0eb69ebd65a5d0b687d87e3a8b2c42b648aa723c7c7daf37abcc4bb85caea2ee8f55bec20e913b3324ab8f5c3304f820d42ad1b9f2ffc1a3af9927136b4419e1e579ab4c2ae3c776d293d397d575df181e6cae0a4ada5d67ecea171cca3288d57c7bbdaee3befe745fb7d634f70386d873b90c4d6c6596bb65af68f9e5121e67ebf0d89d3c909ceedfb32ce9575a7758ff080724e1ab5d5f43074ecb53a479af21ed03d7b6899c36631c0166f9d47e5e1d4528a5d3d3f744029c4b1c190cbfbad06f5f83f7ad0429fa9a2719c56ffe3783460e166de2d8>'}
		
		const keepToggle = document.getElementById('keeptogggle');
		const keepaliveInput = document.getElementById('keepalive');
		let persistentKeepalive = '';
		if (keepToggle.checked) {
			let keepaliveValue = keepaliveInput ? keepaliveInput.value.trim() : '';
			if (keepaliveValue && /^\d+$/.test(keepaliveValue)) {
				persistentKeepalive = `\nPersistentKeepalive = ${keepaliveValue}`;
			} else if (keepaliveValue === '') {
				persistentKeepalive = `\nPersistentKeepalive = 25`;
			}
		}
		
		const ipv6Toggle = document.getElementById('ipv6');
		let address = configData.client_ipv4;
		let dns = selectedDNS;
		
		if (ipv6Toggle.checked) {
			address = `${configData.client_ipv4}, ${configData.client_ipv6}`;
		} else {dns = dns.split(',').filter(ip => !ip.includes(':')).join(',');}
		
		const allowedIPs = getSelectedSites();
		const wireGuardText = `[Interface]
PrivateKey = ${configData.privKey}
Address = ${address}
DNS = ${dns}
MTU = 1280
S1 = 0
S2 = 0
S3 = 0
S4 = 0
Jc = 4
Jmin = 40
Jmax = 70
H1 = 1
H2 = 2
H3 = 3
H4 = 4
${i1Value}

[Peer]
PublicKey = ${configData.peer_pub}
AllowedIPs = ${allowedIPs}
Endpoint = ${randomEndpoint}${persistentKeepalive}`;
	    const content = wireGuardText || "No configuration available";
    if (content === "No configuration available") {
        showPopup('No configuration to download', 'Ошибка');
        return;
    }
	
    const fileName = getConfigFilename('WARPv1', randomNumber);
    downloadConfig(fileName, content);
    showPopup('Скачивание конфигурации');
    } catch (error) {
        console.error('Error processing configuration:', error);
showPopup('Ошибка. Подождите несколько минут или воспользуйтесь <a href="https://warp-generator-config.vercel.app/" target="_blank" style="color: #fff; text-decoration: underline; font-weight: bold;">зеркалом</a>', 'error');
    } finally {
        button.disabled = false;
        button.classList.remove("button--loading");
    } 
	
});

// AWGm2
AWGm2.addEventListener('click', async () => {
    	const button = document.getElementById('generateButton2');
    const status = document.getElementById('status');
	const randomEndpoint = generateRandomEndpoint();
    const randomNumber = Math.floor(Math.random() * (99 - 10 + 1)) + 10;
    button.disabled = true;
    button.classList.add("button--loading");
    try {
        const configData = await fetchFullConfig();
		const selectedDNS = getSelectedDNS();
		const i1Toggle = document.getElementById('i1toggle');
		const i2area = document.getElementById('i2');
		let i1Value = '';
		if (i1Toggle.checked && i2area.value.trim()) {i1Value = i2area.value.trim()} else {i1Value = 'I1 = <b 0xc7000000010809a1ed4edbbe7615000044d017a61a0d774f04290f119e701ef0035df2b0ed571b0b575e6a07246b856eb6ec036fef07f1e07b861251ad737abeb67e64be714c1dcd865312b1b6c35c089c997aeb5c18f808696fe97289513945d84ca846467603e94e44224877f2c1d3261e4ac18740be4bd064369c94fc08978d99b54bf615250998639010c1284248e1d73004b81fcb20b559d8a17eced7eab3964b5b88ca7a3b8579fc8c1c934189e77143b4ac434138114b1048651b56545b87acbef0952763538f3ddeb37cfc6d58b4881c3b719d7ff78f6ee1324a2914a32381c05a64c700466d280be007253bb030d179c4f1b3dc221e1974e2ee6d6e2b9e8d709159b5ef22e1783dbba845c20ca1c83b066c73835920ad70b806df0aee0351e3fc9ab1e42e8b2a30fe235ff0612eee19744949cecee0463b76514ad90c1f7ceaa557c18586ab561d49482e73c85d0143785da14a441bf82f78783b61cccd44aecb1947516e79b5ca5a6b3a8aed6040fae0eeabdc55a88dc19ade832d99fca90c7a629cacc07192d7e47e3c6a271b95b0ea3392562a06a1cab79f40ea92916ebee197b7b5f14b251824e1ed20ff2ca80b1f03a43e45157589bc61b978e97851025b3b7ccc17d291e1cb60fe48a5c26829dce11dd23c2e73265a9ebf8617c985e4fee4681e863f990061f4dea465a7d2524bd0edcf4b48d4b8f25fc359b15babd2637284a4774077dca60091f1a781cfee1bef9713dd5943a579d7470bc5970542fbb27fdf77880a8d8751b1f642c7a3f019a05ab94bf63d3525ef34e9290b5c8d477f2714e6d6e3e4d35c1983f5e16fda57fcdf071b513f8f088dbe8d5a97577d17a5383a496c3f313adfdd47c962bbaebd6aa13b46439eb742622c29ca067db0ec1853064c3cbbffe0a215a19fce47d49703ed58ebbd89721172d256d1cf30188106fb2f863186511401fad54d087aa2fb3d1b85768db386bd7102e8060ac157bac011acdcdae2799b9aee1467c3424013455bd028fcaacdc3c77d28ea199967d617ea7d0d0815f3cc407934a76d1293dccba210d1709a13e5dd67c9ba47cd113f5bdd740358eff13164159fd09bc2f7ec6cfa64d9df7e2e2f88706b0ff3a92ccf6f078456cfe0bdd89292cfe2680badc1eac9f7d36efe8eb6912c7b164508d13e6c0911c15f73c233cbe4fc70ff2ade1e1be4bbb738e0939159e2078a9438f05b756a003371f4861481c38f1cdd2d7b06deb62869e9fe79a8abaa920646fa2e8fa28f0d80c136376c7b56046bae4c05c0cdf64efb8c47bbfc5a1a4c0b045061ef0d71618e0d206a1d7f245fd5c03191b152673ba8dff8e1b8de7c50234a93cba91e3888adb228cc02beded4b1c0946797d3ef02dec2edb6ad0ac21f89f4be364c317da7c22440e9f358d512203f4b7ab20388af68b8915d0152db2c8a0687bfaea870f7529bb92a22b35bd79bc6d490591406346ecd78342ee3563c4883a8251679691c2d4e963397e24653520795511b018915374c954bddb940a9d7a16d1c8bd798fc7dbfb0599a7074e13f87e14efa8d511bb2579ec029b1bda18fe971b30fbe19e986ff2686a69bf3f1bb929de93ae70345ebca998b11e0a2b41890cba628d8f6e7c4e94790735e5299b4ff07cd3080f7d53c9cbe1911d2cd5925b3213e033c272506a87886cf761a283a779564d3241e3c28f632e166b5d756e1786ce077614c4444e3f2aed5decb3613b925ea3e558c21d4faf8ba54edd0f3a5d4>'}
		
		const keepToggle = document.getElementById('keeptogggle');
		const keepaliveInput = document.getElementById('keepalive');
		let persistentKeepalive = '';
		if (keepToggle.checked) {
			let keepaliveValue = keepaliveInput ? keepaliveInput.value.trim() : '';
			if (keepaliveValue && /^\d+$/.test(keepaliveValue)) {
				persistentKeepalive = `\nPersistentKeepalive = ${keepaliveValue}`;
			} else if (keepaliveValue === '') {
				persistentKeepalive = `\nPersistentKeepalive = 25`;
			}
		}
		
		const ipv6Toggle = document.getElementById('ipv6');
		let address = configData.client_ipv4;
		let dns = selectedDNS;
		
		if (ipv6Toggle.checked) {
			address = `${configData.client_ipv4}, ${configData.client_ipv6}`;			
		} else {dns = dns.split(',').filter(ip => !ip.includes(':')).join(',');}
		
		const allowedIPs = getSelectedSites();
		const wireGuardText = `[Interface]
PrivateKey = ${configData.privKey}
Address = ${address}
DNS = ${dns}	
MTU = 1280
S1 = 0
S2 = 0
S3 = 0
S4 = 0
Jc = 4
Jmin = 40
Jmax = 70
H1 = 1
H2 = 2
H3 = 3
H4 = 4
${i1Value}

[Peer]
PublicKey = ${configData.peer_pub}
AllowedIPs = ${allowedIPs}
Endpoint = ${randomEndpoint}${persistentKeepalive}`;
	    const content = wireGuardText || "No configuration available";
    if (content === "No configuration available") {
        showPopup('No configuration to download', 'Ошибка');
        return;
    }
    const fileName = getConfigFilename('WARPv2', randomNumber);
    downloadConfig(fileName, content);
    showPopup('Скачивание конфигурации');
    } catch (error) {
        console.error('Error processing configuration:', error);
showPopup('Ошибка. Подождите несколько минут или воспользуйтесь <a href="https://warp-generator-config.vercel.app/" target="_blank" style="color: #fff; text-decoration: underline; font-weight: bold;">зеркалом</a>', 'error');
    } finally {
        button.disabled = false;
        button.classList.remove("button--loading");
    } 
});

// AWGm3
AWGm3.addEventListener('click', async () => {
    	const button = document.getElementById('generateButton3');
    const status = document.getElementById('status');
	const randomEndpoint = generateRandomEndpoint();
    const randomNumber = Math.floor(Math.random() * (99 - 10 + 1)) + 10;
    button.disabled = true;
    button.classList.add("button--loading");
    try {
		const configData = await fetchFullConfig();
		const selectedDNS = getSelectedDNS();
		const i1Toggle = document.getElementById('i1toggle');
		const i2area = document.getElementById('i2');
		let i1Value = '';
		if (i1Toggle.checked && i2area.value.trim()) {i1Value = i2area.value.trim()} else {i1Value = 'I1 = <b 0x494e56495445207369703a626f624062696c6f78692e636f6d205349502f322e300d0a5669613a205349502f322e302f55445020706333332e61746c616e74612e636f6d3b6272616e63683d7a39684734624b3737366173646864730d0a4d61782d466f7277617264733a2037300d0a546f3a20426f62203c7369703a626f624062696c6f78692e636f6d3e0d0a46726f6d3a20416c696365203c7369703a616c6963654061746c616e74612e636f6d3e3b7461673d313932383330313737340d0a43616c6c2d49443a20613834623463373665363637313040706333332e61746c616e74612e636f6d0d0a435365713a2033313431353920494e564954450d0a436f6e746163743a203c7369703a616c69636540706333332e61746c616e74612e636f6d3e0d0a436f6e74656e742d547970653a206170706c69636174696f6e2f7364700d0a436f6e74656e742d4c656e6774683a20300d0a0d0a>\nI2 = <b 0x5349502f322e302031303020547279696e670d0a5669613a205349502f322e302f55445020706333332e61746c616e74612e636f6d3b6272616e63683d7a39684734624b3737366173646864730d0a546f3a20426f62203c7369703a626f624062696c6f78692e636f6d3e0d0a46726f6d3a20416c696365203c7369703a616c6963654061746c616e74612e636f6d3e3b7461673d313932383330313737340d0a43616c6c2d49443a20613834623463373665363637313040706333332e61746c616e74612e636f6d0d0a435365713a2033313431353920494e564954450d0a436f6e74656e742d4c656e6774683a20300d0a0d0a>'}
		
		const keepToggle = document.getElementById('keeptogggle');
		const keepaliveInput = document.getElementById('keepalive');
		let persistentKeepalive = '';
		if (keepToggle.checked) {
			let keepaliveValue = keepaliveInput ? keepaliveInput.value.trim() : '';
			if (keepaliveValue && /^\d+$/.test(keepaliveValue)) {
				persistentKeepalive = `\nPersistentKeepalive = ${keepaliveValue}`;
			} else if (keepaliveValue === '') {
				persistentKeepalive = `\nPersistentKeepalive = 25`;
			}
		}		
		
		const ipv6Toggle = document.getElementById('ipv6');
		let address = configData.client_ipv4;
		let dns = selectedDNS;
		
		if (ipv6Toggle.checked) {
			address = `${configData.client_ipv4}, ${configData.client_ipv6}`;
		} else {dns = dns.split(',').filter(ip => !ip.includes(':')).join(',');}
		
		const allowedIPs = getSelectedSites();
		const wireGuardText = `[Interface]
PrivateKey = ${configData.privKey}
Address = ${address}
DNS = ${dns}	
MTU = 1280
S1 = 0
S2 = 0
S3 = 0
S4 = 0
Jc = 4
Jmin = 40
Jmax = 70
H1 = 1
H2 = 2
H3 = 3
H4 = 4
${i1Value}

[Peer]
PublicKey = ${configData.peer_pub}
AllowedIPs = ${allowedIPs}
Endpoint = ${randomEndpoint}${persistentKeepalive}`;
	    const content = wireGuardText || "No configuration available";
    if (content === "No configuration available") {
        showPopup('No configuration to download', 'Ошибка');
        return;
    }

    const fileName = getConfigFilename('WARPv3', randomNumber);
    downloadConfig(fileName, content);
    showPopup('Скачивание конфигурации');
    } catch (error) {
        console.error('Error processing configuration:', error);
showPopup('Ошибка. Подождите несколько минут или воспользуйтесь <a href="https://warp-generator-config.vercel.app/" target="_blank" style="color: #fff; text-decoration: underline; font-weight: bold;">зеркалом</a>', 'error');
    } finally {
        button.disabled = false;
        button.classList.remove("button--loading");
    } 
});

// Clash
Clash.addEventListener('click', async () => {
    const button = document.getElementById('generateButton4');
    const status = document.getElementById('status');
    const randomNumber = Math.floor(Math.random() * (99 - 10 + 1)) + 10;
    button.disabled = true;
    button.classList.add("button--loading");
    try {
		const configData = await fetchFullConfig();
		let awg = ''
		let proxy = ''
		let proxyg = `proxy-groups:
- name: WARP
  type: select
  icon: https://www.vectorlogo.zone/logos/cloudflare/cloudflare-icon.svg
  proxies:
    - "Стандартный 1"
    - "Стандартный 2"
    - "Стандартный 3"
  url: 'http://speed.cloudflare.com/'
  interval: 300
rules:
- MATCH,WARP`
		
		const serversToggle = document.getElementById('servers');
		if (serversToggle.checked) {
			awg = `awg: &awg
  amnezia-wg-option:
   jc: 4
   jmin: 40
   jmax: 70
   s1: 0
   s2: 0
   h1: 1
   h2: 2
   h4: 3
   h3: 4  
   i1: <b 0xc800000001018800002b45615e996de27ff5ec5f583061ab38eac69fd8fec356802847cd1c7c15a87402bb0a433d4054defedc066e>`;
			proxy = `- name: "🇵🇱 PL"
  <<: [ *warp-common, *awg ]
  server: pl.tribukvy.ltd
  port: 500
- name: "🇪🇪 EE"
  <<: [ *warp-common, *awg ]
  server: ee.tribukvy.ltd
  port: 500  
- name: "🇳🇱 NL"
  <<: [ *warp-common, *awg ]
  server: nl.tribukvy.ltd
  port: 500  
- name: "🇫🇮 FI"
  <<: [ *warp-common, *awg ]
  server: fi1.tribukvy.ltd
  port: 500
- name: "🇺🇸 US"
  <<: [ *warp-common, *awg ]
  server: usa.tribukvy.ltd
  port: 500  
- name: "🇷🇺 RU"
  <<: [ *warp-common, *awg ]
  server: ru0.tribukvy.ltd
  port: 500`;
			proxyg = `proxy-groups:
- name: WARP + llimonix
  type: select
  icon: https://www.vectorlogo.zone/logos/cloudflare/cloudflare-icon.svg
  proxies:
    - "Стандартный 1"
    - "Стандартный 2"
    - "Стандартный 3"
    - "🇺🇸 US"
    - "🇵🇱 PL"
    - "🇪🇪 EE"
    - "🇳🇱 NL"
    - "🇫🇮 FI"
    - "🇷🇺 RU"
  url: 'http://speed.cloudflare.com/'
  interval: 300
rules:
- MATCH,WARP + llimonix`;
		}
		
        const wireGuardText = `warp-common: &warp-common
  type: wireguard
  ip: ${configData.client_ipv4}
  ipv6: ${configData.client_ipv6}
  private-key: ${configData.privKey}
  public-key: ${configData.peer_pub}
  allowed-ips: ['0.0.0.0/0']
  udp: true
  mtu: 1280
  remote-dns-resolve: true
  dns: [1.1.1.1, 1.0.0.1, 2606:4700:4700::1111, 2606:4700:4700::1001]

${awg}  
  
proxies:
- name: "Стандартный 1"
  <<: *warp-common
  server: 162.159.192.1
  port: 4500
  amnezia-wg-option:
   jc: 4
   jmin: 40
   jmax: 70
   s1: 0
   s2: 0
   h1: 1
   h2: 2
   h4: 3
   h3: 4  
   i1: <b 0xce000000010897a297ecc34cd6dd000044d0ec2e2e1ea2991f467ace4222129b5a098823784694b4897b9986ae0b7280135fa85e196d9ad980b150122129ce2a9379531b0fd3e871ca5fdb883c369832f730e272d7b8b74f393f9f0fa43f11e510ecb2219a52984410c204cf875585340c62238e14ad04dff382f2c200e0ee22fe743b9c6b8b043121c5710ec289f471c91ee414fca8b8be8419ae8ce7ffc53837f6ade262891895f3f4cecd31bc93ac5599e18e4f01b472362b8056c3172b513051f8322d1062997ef4a383b01706598d08d48c221d30e74c7ce000cdad36b706b1bf9b0607c32ec4b3203a4ee21ab64df336212b9758280803fcab14933b0e7ee1e04a7becce3e2633f4852585c567894a5f9efe9706a151b615856647e8b7dba69ab357b3982f554549bef9256111b2d67afde0b496f16962d4957ff654232aa9e845b61463908309cfd9de0a6abf5f425f577d7e5f6440652aa8da5f73588e82e9470f3b21b27b28c649506ae1a7f5f15b876f56abc4615f49911549b9bb39dd804fde182bd2dcec0c33bad9b138ca07d4a4a1650a2c2686acea05727e2a78962a840ae428f55627516e73c83dd8893b02358e81b524b4d99fda6df52b3a8d7a5291326e7ac9d773c5b43b8444554ef5aea104a738ed650aa979674bbed38da58ac29d87c29d387d80b526065baeb073ce65f075ccb56e47533aef357dceaa8293a523c5f6f790be90e4731123d3c6152a70576e90b4ab5bc5ead01576c68ab633ff7d36dcde2a0b2c68897e1acfc4d6483aaaeb635dd63c96b2b6a7a2bfe042f6aed82e5363aa850aace12ee3b1a93f30d8ab9537df483152a5527faca21efc9981b304f11fc95336f5b9637b174c5a0659e2b22e159a9fed4b8e93047371175b1d6d9cc8ab745f3b2281537d1c75fb9451871864efa5d184c38c185fd203de206751b92620f7c369e031d2041e152040920ac2c5ab5340bfc9d0561176abf10a147287ea90758575ac6a9f5ac9f390d0d5b23ee12af583383d994e22c0cf42383834bcd3ada1b3825a0664d8f3fb678261d57601ddf94a8a68a7c273a18c08aa99c7ad8c6c42eab67718843597ec9930457359dfdfbce024afc2dcf9348579a57d8d3490b2fa99f278f1c37d87dad9b221acd575192ffae1784f8e60ec7cee4068b6b988f0433d96d6a1b1865f4e155e9fe020279f434f3bf1bd117b717b92f6cd1cc9bea7d45978bcc3f24bda631a36910110a6ec06da35f8966c9279d130347594f13e9e07514fa370754d1424c0a1545c5070ef9fb2acd14233e8a50bfc5978b5bdf8bc1714731f798d21e2004117c61f2989dd44f0cf027b27d4019e81ed4b5c31db347c4a3a4d85048d7093cf16753d7b0d15e078f5c7a5205dc2f87e330a1f716738dce1c6180e9d02869b5546f1c4d2748f8c90d9693cba4e0079297d22fd61402dea32ff0eb69ebd65a5d0b687d87e3a8b2c42b648aa723c7c7daf37abcc4bb85caea2ee8f55bec20e913b3324ab8f5c3304f820d42ad1b9f2ffc1a3af9927136b4419e1e579ab4c2ae3c776d293d397d575df181e6cae0a4ada5d67ecea171cca3288d57c7bbdaee3befe745fb7d634f70386d873b90c4d6c6596bb65af68f9e5121e67ebf0d89d3c909ceedfb32ce9575a7758ff080724e1ab5d5f43074ecb53a479af21ed03d7b6899c36631c0166f9d47e5e1d4528a5d3d3f744029c4b1c190cbfbad06f5f83f7ad0429fa9a2719c56ffe3783460e166de2d8>
- name: "Стандартный 2"
  <<: *warp-common
  server: 162.159.192.1
  port: 4500
  amnezia-wg-option:
   jc: 4
   jmin: 40
   jmax: 70
   s1: 0
   s2: 0
   h1: 1
   h2: 2
   h4: 3
   h3: 4
   i1: <b 0xc7000000010809a1ed4edbbe7615000044d017a61a0d774f04290f119e701ef0035df2b0ed571b0b575e6a07246b856eb6ec036fef07f1e07b861251ad737abeb67e64be714c1dcd865312b1b6c35c089c997aeb5c18f808696fe97289513945d84ca846467603e94e44224877f2c1d3261e4ac18740be4bd064369c94fc08978d99b54bf615250998639010c1284248e1d73004b81fcb20b559d8a17eced7eab3964b5b88ca7a3b8579fc8c1c934189e77143b4ac434138114b1048651b56545b87acbef0952763538f3ddeb37cfc6d58b4881c3b719d7ff78f6ee1324a2914a32381c05a64c700466d280be007253bb030d179c4f1b3dc221e1974e2ee6d6e2b9e8d709159b5ef22e1783dbba845c20ca1c83b066c73835920ad70b806df0aee0351e3fc9ab1e42e8b2a30fe235ff0612eee19744949cecee0463b76514ad90c1f7ceaa557c18586ab561d49482e73c85d0143785da14a441bf82f78783b61cccd44aecb1947516e79b5ca5a6b3a8aed6040fae0eeabdc55a88dc19ade832d99fca90c7a629cacc07192d7e47e3c6a271b95b0ea3392562a06a1cab79f40ea92916ebee197b7b5f14b251824e1ed20ff2ca80b1f03a43e45157589bc61b978e97851025b3b7ccc17d291e1cb60fe48a5c26829dce11dd23c2e73265a9ebf8617c985e4fee4681e863f990061f4dea465a7d2524bd0edcf4b48d4b8f25fc359b15babd2637284a4774077dca60091f1a781cfee1bef9713dd5943a579d7470bc5970542fbb27fdf77880a8d8751b1f642c7a3f019a05ab94bf63d3525ef34e9290b5c8d477f2714e6d6e3e4d35c1983f5e16fda57fcdf071b513f8f088dbe8d5a97577d17a5383a496c3f313adfdd47c962bbaebd6aa13b46439eb742622c29ca067db0ec1853064c3cbbffe0a215a19fce47d49703ed58ebbd89721172d256d1cf30188106fb2f863186511401fad54d087aa2fb3d1b85768db386bd7102e8060ac157bac011acdcdae2799b9aee1467c3424013455bd028fcaacdc3c77d28ea199967d617ea7d0d0815f3cc407934a76d1293dccba210d1709a13e5dd67c9ba47cd113f5bdd740358eff13164159fd09bc2f7ec6cfa64d9df7e2e2f88706b0ff3a92ccf6f078456cfe0bdd89292cfe2680badc1eac9f7d36efe8eb6912c7b164508d13e6c0911c15f73c233cbe4fc70ff2ade1e1be4bbb738e0939159e2078a9438f05b756a003371f4861481c38f1cdd2d7b06deb62869e9fe79a8abaa920646fa2e8fa28f0d80c136376c7b56046bae4c05c0cdf64efb8c47bbfc5a1a4c0b045061ef0d71618e0d206a1d7f245fd5c03191b152673ba8dff8e1b8de7c50234a93cba91e3888adb228cc02beded4b1c0946797d3ef02dec2edb6ad0ac21f89f4be364c317da7c22440e9f358d512203f4b7ab20388af68b8915d0152db2c8a0687bfaea870f7529bb92a22b35bd79bc6d490591406346ecd78342ee3563c4883a8251679691c2d4e963397e24653520795511b018915374c954bddb940a9d7a16d1c8bd798fc7dbfb0599a7074e13f87e14efa8d511bb2579ec029b1bda18fe971b30fbe19e986ff2686a69bf3f1bb929de93ae70345ebca998b11e0a2b41890cba628d8f6e7c4e94790735e5299b4ff07cd3080f7d53c9cbe1911d2cd5925b3213e033c272506a87886cf761a283a779564d3241e3c28f632e166b5d756e1786ce077614c4444e3f2aed5decb3613b925ea3e558c21d4faf8ba54edd0f3a5d4>
- name: "Стандартный 3"
  <<: *warp-common
  server: 162.159.192.1
  port: 4500
  amnezia-wg-option:
   jc: 4
   jmin: 40
   jmax: 70
   s1: 0
   s2: 0
   h1: 1
   h2: 2
   h4: 3
   h3: 4   
   i1: <b 0x494e56495445207369703a626f624062696c6f78692e636f6d205349502f322e300d0a5669613a205349502f322e302f55445020706333332e61746c616e74612e636f6d3b6272616e63683d7a39684734624b3737366173646864730d0a4d61782d466f7277617264733a2037300d0a546f3a20426f62203c7369703a626f624062696c6f78692e636f6d3e0d0a46726f6d3a20416c696365203c7369703a616c6963654061746c616e74612e636f6d3e3b7461673d313932383330313737340d0a43616c6c2d49443a20613834623463373665363637313040706333332e61746c616e74612e636f6d0d0a435365713a2033313431353920494e564954450d0a436f6e746163743a203c7369703a616c69636540706333332e61746c616e74612e636f6d3e0d0a436f6e74656e742d547970653a206170706c69636174696f6e2f7364700d0a436f6e74656e742d4c656e6774683a20300d0a0d0a>
   i2: <b 0x5349502f322e302031303020547279696e670d0a5669613a205349502f322e302f55445020706333332e61746c616e74612e636f6d3b6272616e63683d7a39684734624b3737366173646864730d0a546f3a20426f62203c7369703a626f624062696c6f78692e636f6d3e0d0a46726f6d3a20416c696365203c7369703a616c6963654061746c616e74612e636f6d3e3b7461673d313932383330313737340d0a43616c6c2d49443a20613834623463373665363637313040706333332e61746c616e74612e636f6d0d0a435365713a2033313431353920494e564954450d0a436f6e74656e742d4c656e6774683a20300d0a0d0a>

${proxy}
    
${proxyg}`;
        const content = wireGuardText || "No configuration available";
    if (content === "No configuration available") {
        showPopup('No configuration to download', 'Ошибка');
        return;
    }
    downloadConfig(`ClashWARP_${randomNumber}.yaml`, content);
    showPopup('Скачивание конфигурации');
    } catch (error) {
        console.error('Error processing configuration:', error);
showPopup('Ошибка. Подождите несколько минут или воспользуйтесь <a href="https://warp-generator-config.vercel.app/" target="_blank" style="color: #fff; text-decoration: underline; font-weight: bold;">зеркалом</a>', 'error');
    } finally {
        button.disabled = false;
        button.classList.remove("button--loading");
    } 
});

// WireSock
WireSock.addEventListener('click', async () => {
    const button = document.getElementById('generateButton5');
    const status = document.getElementById('status');
    const randomNumber = Math.floor(Math.random() * (99 - 10 + 1)) + 10;
    button.disabled = true;
    button.classList.add("button--loading");
    try {
		const configData = await fetchFullConfig();
		const selectedDNS = getSelectedDNS();

		const keepToggle = document.getElementById('keeptogggle');
		const keepaliveInput = document.getElementById('keepalive');
		let persistentKeepalive = '';
		if (keepToggle.checked) {
			let keepaliveValue = keepaliveInput ? keepaliveInput.value.trim() : '';
			if (keepaliveValue && /^\d+$/.test(keepaliveValue)) {
				persistentKeepalive = `\nPersistentKeepalive = ${keepaliveValue}`;
			} else if (keepaliveValue === '') {
				persistentKeepalive = `\nPersistentKeepalive = 25`;
			}
		}

		const ipv6Toggle = document.getElementById('ipv6');
		let address = configData.client_ipv4;
		let dns = selectedDNS;
		
		if (ipv6Toggle.checked) {
			address = `${configData.client_ipv4}, ${configData.client_ipv6}`;
		} else {dns = dns.split(',').filter(ip => !ip.includes(':')).join(',');}

        const allowedIPs = getSelectedSites();
        const randomEndpoint = generateRandomEndpoint();
        const domains = ['apteka.ru', 'psbank.ru', 'lenta.ru', 'www.pochta.ru', 'rzd.ru', 'rutube.ru', 'gosuslugi.ru'];
        const randomDomain = domains[Math.floor(Math.random() * domains.length)];
        
        const wireGuardText = `[Interface]
PrivateKey = ${configData.privKey}
Address = ${address}
DNS = ${dns}
MTU = 1280
S1 = 0
S2 = 0
S3 = 0
S4 = 0
Jc = 4
Jmin = 40
Jmax = 70
H1 = 1
H2 = 2
H3 = 3
H4 = 4

# Protocol masking

Id = ${randomDomain}
Ip = quic
Ib = curl

[Peer]
PublicKey = ${configData.peer_pub}
AllowedIPs = ${allowedIPs}
Endpoint = ${randomEndpoint}${persistentKeepalive}`;
        
        const content = wireGuardText || "No configuration available";
        if (content === "No configuration available") {
            showPopup('No configuration to download', 'Ошибка');
            return;
        }

    const fileName = getConfigFilename('WARPw', randomNumber);
    downloadConfig(fileName, content);
        showPopup('Скачивание конфигурации');
    } catch (error) {
        console.error('Error processing configuration:', error);
        showPopup('Ошибка. Подождите несколько минут или воспользуйтесь <a href="https://warp-generator-config.vercel.app/" target="_blank" style="color: #fff; text-decoration: underline; font-weight: bold;">зеркалом</a>', 'error');
    } finally {
        button.disabled = false;
        button.classList.remove("button--loading");
    } 
});


document.getElementById('telegramButton').onclick = function() {
    window.location.href = 'https://t.me/warp_1_1_1_1';
}

document.getElementById('projectsButton').onclick = function() {
    window.location.href = 'https://my-other-projects.vercel.app/';
}

document.getElementById('promoButton').onclick = function() {
    window.location.href = 'https://storage.googleapis.com/amnezia/amnezia.org?m-path=premium&arf=VG755WBZDBAPGGYM';
}

function getSelectedDNS() {
    if (document.getElementById('cf').checked) {
        return "1.1.1.1, 1.0.0.1, 2606:4700:4700::1111, 2606:4700:4700::1001";
    } else if (document.getElementById('malw').checked) {
        return "84.21.189.133, 193.23.209.189, 2a12:bec4:1460:294::2, 2a01:ecc0:680:120::2";
    } else if (document.getElementById('xbox').checked) {
        return "176.99.11.77, 80.78.247.254, 31.192.108.180, 2a00:f940:2:4:2::5d1b, 2a00:f940:2:4:2::21ed";
	} else if (document.getElementById('geohide').checked) {
        return "45.155.204.190, 95.182.120.241, 2a0c:9300:0:54::1";
	} else if (document.getElementById('comss').checked) {
        return "83.220.169.155, 212.109.195.93, 195.133.25.16, 2a01:230:4:915::2, 2a01:230:4:306::2";
	} else if (document.getElementById('google').checked) {
        return "8.8.8.8, 8.8.4.4, 2001:4860:4860::8888, 2001:4860:4860::8844";	
    }
}
function getSelectedSites() {
	
	const toggleCheckbox = document.getElementById('rules');
    if (toggleCheckbox && toggleCheckbox.checked) {
        return "1.0.0.0/8, 2.0.0.0/7, 4.0.0.0/6, 8.0.0.0/7, 11.0.0.0/8, 12.0.0.0/6, 16.0.0.0/4, 32.0.0.0/3, 64.0.0.0/3, 96.0.0.0/4, 112.0.0.0/5, 120.0.0.0/6, 124.0.0.0/7, 126.0.0.0/8, 128.0.0.0/3, 160.0.0.0/5, 168.0.0.0/8, 169.0.0.0/9, 169.128.0.0/10, 169.192.0.0/11, 169.224.0.0/12, 169.240.0.0/13, 169.248.0.0/14, 169.252.0.0/15, 169.255.0.0/16, 170.0.0.0/7, 172.0.0.0/12, 172.32.0.0/11, 172.64.0.0/10, 172.128.0.0/9, 173.0.0.0/8, 174.0.0.0/7, 176.0.0.0/4, 192.0.0.0/9, 192.128.0.0/11, 192.160.0.0/13, 192.169.0.0/16, 192.170.0.0/15, 192.172.0.0/14, 192.176.0.0/12, 192.192.0.0/10, 193.0.0.0/8, 194.0.0.0/7, 196.0.0.0/6, 200.0.0.0/5, 208.0.0.0/4, 224.0.0.0/4, ::/1, 8000::/2, c000::/3, e000::/4, f000::/5, f800::/6, fe00::/9, fec0::/10, ff00::/8";
    }
	
    const sites = [
        { id: 'youtube', ip: '1.0.0.0/9, 1.192.0.0/10, 101.64.0.0/10, 103.0.0.0/14, 103.100.128.0/19, 103.101.0.0/18, 103.103.128.0/17, 103.105.0.0/16, 103.106.192.0/18, 103.107.128.0/17, 103.108.0.0/17, 103.111.128.0/17, 103.111.64.0/19, 103.112.48.0/21, 103.118.64.0/18, 103.119.0.0/16, 103.12.0.0/16, 103.120.0.0/16, 103.122.0.0/15, 103.124.0.0/16, 103.132.16.0/20, 103.132.64.0/18, 103.137.0.0/17, 103.139.128.0/17, 103.14.16.0/20, 103.140.0.0/16, 103.141.64.0/22, 103.144.0.0/16, 103.146.0.0/15, 103.148.0.0/14, 103.15.0.0/16, 103.152.0.0/13, 103.160.0.0/11, 103.17.128.0/17, 103.192.0.0/17, 103.193.0.0/17, 103.196.128.0/17, 103.199.0.0/18, 103.199.192.0/19, 103.199.224.0/21, 103.199.64.0/20, 103.20.0.0/16, 103.200.28.0/22, 103.200.32.0/19, 103.206.128.0/18, 103.21.0.0/17, 103.21.128.0/18, 103.211.104.0/21, 103.211.16.0/20, 103.214.160.0/20, 103.214.192.0/18, 103.218.0.0/16, 103.221.128.0/17, 103.225.176.0/20, 103.225.96.0/19, 103.226.128.0/18, 103.226.224.0/19, 103.228.130.0/23, 103.230.0.0/17, 103.232.128.0/19, 103.233.0.0/16, 103.234.0.0/17, 103.240.180.0/22, 103.242.0.0/19, 103.242.128.0/17, 103.243.0.0/18, 103.243.112.0/21, 103.246.240.0/21, 103.249.0.0/16, 103.25.128.0/17, 103.251.0.0/17, 103.251.192.0/18, 103.252.96.0/19, 103.26.208.0/20, 103.27.0.0/17, 103.28.0.0/15, 103.38.0.0/16, 103.39.128.0/17, 103.39.64.0/18, 103.40.0.0/16, 103.41.0.0/19, 103.42.0.0/16, 103.44.0.0/16, 103.52.0.0/16, 103.54.32.0/19, 103.56.0.0/17, 103.58.64.0/18, 103.59.128.0/17, 103.62.128.0/17, 103.66.64.0/18, 103.7.0.0/17, 103.70.0.0/16, 103.73.160.0/21, 103.73.64.0/18, 103.76.192.0/18, 103.80.0.0/17, 103.85.128.0/17, 103.85.64.0/18, 103.88.192.0/19, 103.89.0.0/16, 103.94.128.0/17, 103.97.0.0/18, 103.97.128.0/18, 104.16.0.0/12, 104.237.160.0/19, 104.244.40.0/21, 104.36.192.0/21, 105.0.0.0/8, 106.0.0.0/8, 107.181.160.0/19, 108.160.160.0/20, 108.177.0.0/17, 109.224.41.0/24, 109.239.184.0/21, 110.0.0.0/10, 110.128.0.0/10, 110.64.0.0/12, 110.93.128.0/17, 111.0.0.0/8, 112.0.0.0/8, 113.128.0.0/10, 113.192.0.0/13, 113.64.0.0/10, 114.0.0.0/9, 114.136.0.0/13, 114.250.63.0/24, 114.250.64.0/23, 114.250.67.0/24, 114.250.69.0/24, 114.250.70.0/24, 115.126.0.0/15, 115.164.0.0/15, 115.176.0.0/12, 115.64.0.0/11, 116.204.128.0/18, 116.206.0.0/18, 116.206.128.0/19, 116.212.128.0/19, 116.56.0.0/13, 116.64.0.0/10, 117.0.0.0/12, 117.128.0.0/9, 117.52.0.0/15, 117.55.224.0/19, 117.96.0.0/12, 118.107.180.0/22, 118.128.0.0/9, 118.68.0.0/14, 118.96.0.0/13, 119.0.0.0/13, 119.152.0.0/13, 119.16.0.0/12, 119.160.0.0/11, 119.32.0.0/11, 120.0.0.0/8, 121.64.0.0/12, 122.0.0.0/10, 122.144.0.0/14, 122.152.0.0/13, 122.192.0.0/11, 122.248.0.0/14, 122.252.0.0/15, 123.104.0.0/13, 123.128.0.0/10, 123.192.0.0/11, 123.240.0.0/13, 123.253.0.0/18, 124.0.0.0/9, 124.192.0.0/11, 124.248.0.0/14, 125.128.0.0/9, 125.64.0.0/10, 128.0.0.0/16, 128.121.0.0/16, 128.242.0.0/16, 128.75.0.0/16, 130.211.0.0/16, 137.59.16.0/20, 137.59.32.0/20, 137.59.64.0/18, 139.5.64.0/19, 14.102.128.0/18, 14.128.0.0/9, 140.213.0.0/16, 142.161.0.0/16, 142.250.0.0/15, 144.48.128.0/18, 145.236.72.0/23, 145.255.0.0/20, 148.163.0.0/17, 148.64.96.0/20, 148.69.0.0/16, 149.54.0.0/17, 150.107.0.0/18, 150.107.204.0/22, 150.129.0.0/21, 150.129.32.0/19, 150.129.96.0/19, 154.0.0.0/13, 154.64.0.0/10, 156.233.0.0/16, 157.20.0.0/16, 157.240.0.0/16, 157.8.0.0/14, 159.106.0.0/16, 159.138.0.0/16, 159.192.0.0/16, 159.65.0.0/16, 161.49.0.0/17, 162.125.0.0/16, 162.220.8.0/21, 162.252.180.0/22, 163.40.0.0/13, 163.53.64.0/18, 164.215.0.0/16, 165.165.0.0/16, 165.21.0.0/16, 166.70.0.0/16, 168.143.0.0/16, 170.238.0.0/16, 171.128.0.0/9, 171.96.0.0/11, 172.217.0.0/16, 172.253.0.0/16, 172.64.0.0/13, 173.194.0.0/16, 173.208.128.0/17, 173.231.0.0/18, 173.234.32.0/19, 173.236.128.0/17, 173.244.192.0/19, 173.252.192.0/18, 173.252.64.0/18, 173.255.192.0/18, 174.36.0.0/15, 175.104.0.0/14, 175.112.0.0/12, 175.96.0.0/13, 176.28.128.0/17, 177.64.0.0/12, 178.151.230.0/24, 178.176.156.0/24, 178.22.168.0/24, 179.32.0.0/12, 179.60.0.0/16, 179.64.0.0/10, 180.149.224.0/19, 180.149.48.0/20, 180.149.64.0/18, 180.160.0.0/11, 180.192.0.0/11, 181.0.0.0/11, 181.208.0.0/14, 182.0.0.0/9, 182.176.0.0/12, 182.192.0.0/10, 183.0.0.0/8, 184.150.0.0/17, 184.150.128.0/18, 184.172.0.0/15, 184.72.0.0/15, 185.100.209.0/24, 185.158.208.0/23, 185.192.248.0/26, 185.192.249.0/24, 185.192.251.192/26, 185.23.124.0/23, 185.45.4.0/22, 185.48.9.0/24, 185.5.161.0/26, 185.60.216.0/22, 185.61.94.0/23, 186.128.0.0/9, 187.0.0.0/11, 187.128.0.0/9, 188.114.96.0/22, 188.120.127.0/24, 188.21.9.0/24, 188.43.61.0/24, 188.43.68.0/23, 188.93.174.0/24, 189.128.0.0/9, 190.0.0.0/10, 190.224.0.0/11, 192.133.76.0/22, 192.135.88.0/21, 192.178.0.0/15, 192.248.0.0/17, 192.86.0.0/24, 193.109.164.0/22, 193.126.242.0/26, 194.78.0.0/24, 194.9.24.0/24, 194.9.25.0/24, 195.12.177.0/26, 195.176.255.192/26, 195.187.0.0/16, 195.87.177.0/24, 195.95.178.0/24, 196.1.128.0/17, 196.128.0.0/9, 196.32.0.0/11, 197.0.0.0/8, 198.27.64.0/18, 198.44.160.0/19, 199.16.156.0/22, 199.193.112.0/21, 199.59.148.0/22, 199.85.224.0/21, 199.96.56.0/21, 200.96.0.0/11, 201.0.0.0/11, 201.160.0.0/11, 201.48.0.0/16, 202.128.0.0/14, 202.136.0.0/13, 202.148.0.0/14, 202.152.0.0/13, 202.160.0.0/15, 202.163.0.0/16, 202.165.0.0/16, 202.166.0.0/15, 202.168.0.0/15, 202.182.0.0/15, 202.184.0.0/13, 202.24.0.0/13, 202.39.0.0/16, 202.51.64.0/21, 202.51.72.0/22, 202.51.79.0/24, 202.52.0.0/14, 202.60.0.0/16, 202.64.0.0/14, 202.68.0.0/15, 202.70.0.0/16, 202.72.0.0/14, 202.79.0.0/17, 202.80.0.0/13, 202.88.0.0/14, 202.93.0.0/16, 203.101.0.0/16, 203.110.0.0/15, 203.112.0.0/12, 203.128.0.0/12, 203.144.0.0/13, 203.162.0.0/15, 203.167.0.0/16, 203.170.0.0/16, 203.171.128.0/17, 203.176.0.0/13, 203.184.0.0/14, 203.189.0.0/17, 203.192.0.0/10, 203.64.0.0/13, 203.76.0.0/15, 203.78.0.0/17, 203.80.0.0/13, 204.145.2.0/23, 204.79.196.0/23, 204.84.0.0/15, 205.186.128.0/18, 206.144.0.0/14, 207.231.168.0/21, 208.0.0.0/11, 208.101.0.0/18, 208.110.64.0/19, 208.187.128.0/17, 208.192.0.0/10, 208.43.0.0/16, 208.54.0.0/17, 208.77.40.0/21, 208.84.220.0/22, 208.98.128.0/18, 209.115.128.0/17, 209.141.112.0/20, 209.145.96.0/19, 209.146.0.0/17, 209.148.128.0/17, 209.191.192.0/19, 209.52.0.0/15, 209.85.128.0/17, 209.91.64.0/18, 209.95.32.0/19, 210.0.0.0/7, 212.106.200.0/21, 212.113.52.0/24, 212.156.0.0/16, 212.188.10.0/24, 212.188.34.0/24, 212.188.35.0/24, 212.188.37.0/24, 212.188.49.0/24, 212.20.18.0/24, 212.39.86.0/24, 212.43.1.0/24, 212.43.8.0/21, 212.55.184.0/22, 212.90.48.0/20, 213.152.1.64/27, 213.202.0.0/21, 213.55.64.0/18, 213.59.192.0/18, 216.105.64.0/20, 216.123.192.0/18, 216.19.176.0/20, 216.239.32.0/19, 216.58.192.0/19, 217.119.118.64/26, 217.130.7.0/25, 217.175.200.64/26, 217.197.248.0/23, 217.73.128.0/22, 218.0.0.0/7, 220.0.0.0/9, 220.160.0.0/11, 221.0.0.0/8, 222.0.0.0/8, 223.128.0.0/9, 223.25.128.0/17, 223.27.128.0/17, 223.32.0.0/11, 23.142.48.0/24, 23.152.160.0/24, 23.192.0.0/11, 23.224.0.0/15, 23.234.0.0/18, 23.96.0.0/13, 24.244.0.0/18, 27.112.0.0/13, 27.128.0.0/9, 27.2.0.0/15, 27.64.0.0/11, 27.96.0.0/12, 31.13.64.0/18, 31.145.0.0/16, 34.64.0.0/10, 36.0.0.0/9, 37.152.0.0/22, 38.0.0.0/7, 4.0.0.0/9, 40.136.0.0/15, 41.0.0.0/8, 42.0.0.0/8, 43.224.0.0/16, 43.226.16.0/20, 43.228.0.0/16, 43.230.128.0/21, 43.245.128.0/20, 43.245.144.0/21, 43.245.192.0/20, 43.245.96.0/20, 43.250.0.0/16, 43.252.16.0/21, 45.112.128.0/18, 45.113.128.0/18, 45.114.8.0/21, 45.116.192.0/19, 45.116.224.0/20, 45.118.240.0/21, 45.121.128.0/17, 45.124.0.0/18, 45.127.0.0/17, 45.14.108.0/22, 45.249.0.0/16, 45.253.0.0/16, 45.54.0.0/17, 45.64.0.0/16, 45.76.0.0/15, 46.134.192.0/18, 46.32.101.0/24, 46.36.112.0/20, 46.61.0.0/16, 47.88.0.0/14, 49.192.0.0/11, 49.224.0.0/13, 49.32.0.0/11, 5.195.0.0/16, 5.21.228.0/22, 5.30.0.0/15, 5.32.175.0/24, 50.0.0.0/15, 50.117.0.0/17, 50.128.0.0/9, 50.22.0.0/15, 50.87.0.0/16, 51.39.0.0/16, 52.0.0.0/10, 52.160.0.0/11, 54.144.0.0/12, 54.224.0.0/11, 54.64.0.0/11, 58.0.0.0/10, 58.112.0.0/12, 58.128.0.0/9, 58.64.0.0/11, 59.0.0.0/9, 59.152.0.0/18, 59.152.96.0/20, 59.153.128.0/17, 59.160.0.0/11, 61.0.0.0/13, 61.128.0.0/9, 61.16.0.0/12, 61.32.0.0/11, 61.64.0.0/10, 62.0.0.0/16, 62.149.96.0/20, 62.212.240.0/20, 62.231.75.0/24, 63.64.0.0/10, 64.13.192.0/18, 64.15.112.0/20, 64.233.160.0/19, 64.4.224.0/20, 64.53.128.0/17, 65.192.0.0/11, 65.240.0.0/13, 65.49.0.0/17, 66.102.0.0/20, 66.112.176.0/20, 66.220.144.0/20, 66.248.254.0/24, 66.58.128.0/17, 66.96.224.0/19, 67.15.0.0/16, 67.204.128.0/18, 67.228.0.0/16, 67.230.160.0/19, 67.50.0.0/17, 69.162.128.0/18, 69.171.224.0/19, 69.197.128.0/18, 69.30.0.0/18, 69.48.216.0/21, 69.50.192.0/19, 69.51.64.0/18, 69.59.192.0/19, 69.63.176.0/20, 72.19.32.0/19, 72.234.0.0/15, 74.125.0.0/16, 74.86.0.0/16, 75.126.0.0/16, 75.98.144.0/20, 77.120.12.0/22, 77.37.252.0/23, 79.133.76.0/23, 80.253.29.0/24, 80.77.172.0/22, 80.87.198.0/23, 80.87.64.0/19, 80.97.192.0/18, 81.130.96.0/20, 81.192.0.0/16, 81.200.2.0/24, 81.23.16.0/21, 81.23.24.0/21, 81.27.242.128/27, 82.114.162.0/23, 82.147.133.128/26, 82.148.96.0/19, 82.76.231.64/26, 83.219.145.0/24, 83.224.64.0/20, 84.15.64.0/24, 84.235.64.0/22, 84.235.77.0/24, 84.235.78.0/24, 85.112.112.0/20, 86.120.7.128/27, 86.62.126.64/27, 87.245.192.0/20, 87.245.216.0/21, 88.191.249.0/24, 88.201.0.0/17, 89.27.128.0/17, 90.180.0.0/14, 90.200.0.0/14, 91.185.2.0/24, 92.80.0.0/13, 93.123.23.0/24, 93.179.96.0/21, 94.142.38.0/24, 94.203.108.0/23, 94.24.192.0/18, 94.31.189.0/24, 94.96.0.0/14, 95.142.107.0/27, 95.167.73.0/24, 95.168.192.0/19, 95.59.170.0/24, 95.66.0.0/18, 96.30.64.0/18, 96.44.128.0/18, 96.63.128.0/19, 96.9.128.0/19, 98.159.96.0/20' },
        { id: 'discord', ip: '103.224.0.0/16, 104.16.0.0/12, 108.136.0.0/14, 108.156.0.0/14, 108.177.0.0/17, 13.224.0.0/12, 13.248.0.0/14, 13.32.0.0/12, 138.128.136.0/21, 142.250.0.0/15, 143.204.0.0/16, 15.196.0.0/14, 15.204.0.0/16, 162.158.0.0/15, 162.210.192.0/21, 166.117.0.0/16, 170.178.160.0/19, 172.217.0.0/16, 172.241.208.0/21, 172.253.0.0/16, 172.64.0.0/13, 173.194.0.0/16, 173.208.64.0/18, 173.234.144.0/20, 18.128.0.0/9, 18.64.0.0/10, 185.107.56.0/24, 188.114.96.0/22, 192.157.48.0/20, 192.178.0.0/15, 199.115.112.0/21, 204.11.56.0/23, 207.244.64.0/18, 208.115.192.0/18, 208.91.196.0/23, 209.85.128.0/17, 212.32.224.0/19, 212.7.208.0/22, 212.92.104.0/21, 216.137.32.0/19, 216.245.192.0/19, 216.58.192.0/19, 23.227.32.0/19, 23.82.0.0/16, 3.128.0.0/9, 34.0.0.0/15, 34.2.0.0/15, 34.64.0.0/10, 35.192.0.0/12, 35.208.0.0/12, 37.1.216.0/21, 37.48.64.0/18, 45.134.10.0/24, 5.200.14.128/25, 5.79.64.0/18, 51.81.0.0/16, 52.222.0.0/16, 52.84.0.0/14, 54.224.0.0/11, 64.120.0.0/18, 64.233.160.0/19, 64.31.0.0/18, 65.8.0.0/14, 66.22.192.0/18, 69.162.64.0/18, 70.32.0.0/20, 74.125.0.0/16, 74.63.192.0/18, 75.2.0.0/17, 76.223.0.0/17, 77.247.183.144/28, 8.0.0.0/13, 8.32.0.0/11, 81.17.16.0/20, 81.171.0.0/19, 82.192.64.0/19, 94.229.72.112/28, 99.83.128.0/17, 99.84.0.0/16, 99.86.0.0/16' },
        { id: 'twitter', ip: '104.16.0.0/12, 104.244.40.0/21, 146.75.0.0/16, 151.101.0.0/16, 152.192.0.0/13, 162.158.0.0/15, 172.64.0.0/13, 192.229.128.0/17, 199.232.0.0/16, 209.237.192.0/19, 68.232.32.0/20, 69.195.160.0/19, 93.184.220.0/22' },
        { id: 'instagram', ip: '102.0.0.0/8, 103.200.28.0/22, 103.214.160.0/20, 103.226.224.0/19, 103.228.130.0/23, 103.230.0.0/17, 103.240.180.0/22, 103.246.240.0/21, 103.252.96.0/19, 103.39.64.0/18, 103.42.0.0/16, 103.56.0.0/17, 103.73.160.0/21, 103.97.0.0/18, 103.97.128.0/18, 104.16.0.0/12, 104.244.40.0/21, 107.181.160.0/19, 108.160.160.0/20, 111.0.0.0/8, 114.0.0.0/10, 115.126.0.0/15, 116.64.0.0/10, 118.107.180.0/22, 118.128.0.0/9, 119.16.0.0/12, 122.0.0.0/10, 122.248.0.0/14, 124.0.0.0/9, 128.121.0.0/16, 128.242.0.0/16, 129.134.0.0/16, 130.211.0.0/16, 148.163.0.0/17, 150.107.0.0/18, 154.64.0.0/10, 156.233.0.0/16, 157.240.0.0/16, 159.106.0.0/16, 159.138.0.0/16, 159.65.0.0/16, 162.125.0.0/16, 162.220.8.0/21, 163.70.128.0/17, 168.143.0.0/16, 173.208.128.0/17, 173.231.0.0/18, 173.234.32.0/19, 173.236.128.0/17, 173.244.192.0/19, 173.252.192.0/18, 173.252.64.0/18, 173.255.192.0/18, 174.36.0.0/15, 179.60.0.0/16, 182.0.0.0/9, 184.172.0.0/15, 184.72.0.0/15, 185.45.4.0/22, 185.60.216.0/22, 192.133.76.0/22, 195.229.0.0/16, 198.27.64.0/18, 198.44.160.0/19, 199.16.156.0/22, 199.193.112.0/21, 199.59.148.0/22, 199.96.56.0/21, 202.160.0.0/15, 202.182.0.0/15, 202.52.0.0/14, 203.110.0.0/15, 204.79.196.0/23, 205.186.128.0/18, 208.0.0.0/11, 208.101.0.0/18, 208.43.0.0/16, 208.77.40.0/21, 209.95.32.0/19, 210.0.0.0/7, 212.95.183.192/26, 213.169.57.64/26, 23.224.0.0/15, 23.234.0.0/18, 23.96.0.0/13, 31.13.64.0/18, 38.0.0.0/7, 4.0.0.0/9, 43.226.16.0/20, 45.114.8.0/21, 45.76.0.0/15, 47.88.0.0/14, 50.117.0.0/17, 50.22.0.0/15, 50.87.0.0/16, 52.0.0.0/10, 52.160.0.0/11, 54.224.0.0/11, 54.64.0.0/11, 57.0.0.0/8, 59.0.0.0/9, 59.160.0.0/11, 64.13.192.0/18, 65.49.0.0/17, 66.220.144.0/20, 67.15.0.0/16, 67.228.0.0/16, 67.230.160.0/19, 69.162.128.0/18, 69.171.224.0/19, 69.197.128.0/18, 69.30.0.0/18, 69.50.192.0/19, 69.63.176.0/20, 74.86.0.0/16, 75.126.0.0/16, 80.87.198.0/23, 87.245.208.0/20, 88.191.249.0/24, 93.179.96.0/21, 96.44.128.0/18, 98.159.96.0/20' },
        { id: 'facebook', ip: '102.0.0.0/8, 103.200.28.0/22, 103.226.224.0/19, 103.228.130.0/23, 103.230.0.0/17, 103.240.180.0/22, 103.246.240.0/21, 103.252.96.0/19, 103.42.0.0/16, 103.56.0.0/17, 103.73.160.0/21, 103.97.0.0/18, 103.97.128.0/18, 104.16.0.0/12, 104.244.40.0/21, 104.64.0.0/10, 107.181.160.0/19, 108.160.160.0/20, 111.0.0.0/8, 112.0.0.0/8, 114.0.0.0/10, 115.126.0.0/15, 116.64.0.0/10, 118.107.180.0/22, 118.128.0.0/9, 119.16.0.0/12, 122.0.0.0/10, 122.248.0.0/14, 124.0.0.0/9, 128.121.0.0/16, 128.242.0.0/16, 129.134.0.0/16, 13.104.0.0/14, 148.163.0.0/17, 150.107.0.0/18, 152.192.0.0/13, 154.64.0.0/10, 156.233.0.0/16, 157.240.0.0/16, 159.106.0.0/16, 159.138.0.0/16, 159.65.0.0/16, 162.125.0.0/16, 162.220.8.0/21, 163.70.128.0/17, 168.143.0.0/16, 173.208.128.0/17, 173.231.0.0/18, 173.236.128.0/17, 173.244.192.0/19, 173.252.192.0/18, 173.252.64.0/18, 173.255.192.0/18, 174.36.0.0/15, 179.60.0.0/16, 182.0.0.0/9, 184.172.0.0/15, 184.24.0.0/13, 184.50.0.0/15, 184.72.0.0/15, 185.45.4.0/22, 185.60.216.0/22, 192.133.76.0/22, 195.229.0.0/16, 198.27.64.0/18, 198.44.160.0/19, 199.16.156.0/22, 199.193.112.0/21, 199.59.148.0/22, 199.96.56.0/21, 2.16.102.0/23, 2.16.154.0/24, 2.16.16.0/23, 2.16.168.0/23, 2.16.172.0/23, 2.16.52.0/23, 2.16.62.0/23, 2.17.112.0/22, 2.17.251.0/24, 2.18.16.0/20, 2.18.64.0/20, 2.19.192.0/24, 2.19.196.0/22, 2.19.204.0/22, 2.20.254.0/23, 2.20.45.0/24, 2.21.16.0/20, 2.21.244.0/23, 2.22.230.0/23, 2.22.61.0/24, 2.22.80.0/20, 2.23.144.0/20, 2.23.160.0/20, 2.23.96.0/20, 202.160.0.0/15, 202.182.0.0/15, 202.52.0.0/14, 203.110.0.0/15, 205.186.128.0/18, 208.0.0.0/11, 208.101.0.0/18, 208.43.0.0/16, 208.77.40.0/21, 209.95.32.0/19, 210.0.0.0/7, 212.95.165.0/26, 213.155.157.0/24, 23.0.0.0/12, 23.192.0.0/11, 23.224.0.0/15, 23.234.0.0/18, 23.32.0.0/11, 23.72.0.0/13, 23.96.0.0/13, 31.13.64.0/18, 38.0.0.0/7, 4.0.0.0/9, 43.226.16.0/20, 45.114.8.0/21, 45.76.0.0/15, 47.88.0.0/14, 5.178.43.0/25, 50.117.0.0/17, 50.22.0.0/15, 50.87.0.0/16, 52.0.0.0/10, 52.160.0.0/11, 54.224.0.0/11, 54.64.0.0/11, 57.0.0.0/8, 59.0.0.0/9, 59.160.0.0/11, 62.115.252.0/24, 62.115.253.0/24, 64.13.192.0/18, 65.49.0.0/17, 66.220.144.0/20, 67.15.0.0/16, 67.228.0.0/16, 67.230.160.0/19, 69.162.128.0/18, 69.171.224.0/19, 69.197.128.0/18, 69.30.0.0/18, 69.50.192.0/19, 69.63.176.0/20, 72.246.0.0/15, 74.86.0.0/16, 75.126.0.0/16, 80.239.138.0/24, 80.67.82.0/24, 80.87.198.0/23, 87.245.192.0/20, 88.191.249.0/24, 88.221.110.0/24, 88.221.111.0/24, 88.221.128.0/21, 92.122.100.0/22, 92.122.160.0/20, 92.122.224.0/21, 92.122.244.0/22, 92.123.132.0/22, 92.123.180.0/22, 92.123.96.0/20, 93.179.96.0/21, 95.100.128.0/20, 95.100.176.0/20, 95.101.108.0/22, 95.101.116.0/22, 95.101.20.0/22, 95.101.24.0/22, 95.101.35.0/24, 95.101.72.0/22, 95.101.76.0/22, 96.16.0.0/15, 96.44.128.0/18, 98.159.96.0/20' },
        { id: 'viber', ip: '100.24.0.0/13, 100.48.0.0/12, 103.224.0.0/16, 104.16.0.0/12, 104.64.0.0/10, 107.20.0.0/14, 108.128.0.0/13, 108.136.0.0/14, 108.156.0.0/14, 108.177.0.0/17, 13.134.0.0/15, 13.208.0.0/12, 13.224.0.0/12, 13.248.0.0/14, 13.32.0.0/12, 136.143.176.0/20, 139.162.0.0/16, 142.250.0.0/15, 143.204.0.0/16, 15.184.0.0/14, 15.196.0.0/14, 152.228.128.0/17, 16.24.0.0/13, 172.104.0.0/15, 172.217.0.0/16, 172.253.0.0/16, 172.64.0.0/13, 173.194.0.0/16, 173.222.0.0/15, 174.129.0.0/16, 18.128.0.0/9, 18.64.0.0/10, 184.24.0.0/13, 184.50.0.0/15, 184.72.0.0/15, 185.199.108.0/22, 185.53.177.0/24, 188.114.96.0/22, 192.155.80.0/20, 192.178.0.0/15, 194.90.0.0/16, 199.191.50.0/23, 199.59.240.0/22, 199.60.103.0/24, 2.19.16.0/20, 2.20.16.0/22, 2.20.208.0/20, 2.21.192.0/20, 2.22.128.0/20, 204.141.0.0/16, 204.236.128.0/17, 209.85.128.0/17, 216.137.32.0/19, 216.198.0.0/18, 216.58.192.0/19, 23.0.0.0/12, 23.192.0.0/11, 23.20.0.0/14, 23.239.0.0/19, 23.32.0.0/11, 23.64.0.0/14, 23.72.0.0/13, 3.0.0.0/9, 3.128.0.0/9, 34.192.0.0/10, 34.64.0.0/10, 35.152.0.0/13, 35.160.0.0/12, 35.176.0.0/13, 35.184.0.0/13, 37.59.32.0/19, 44.192.0.0/10, 50.16.0.0/14, 51.24.0.0/16, 51.91.18.0/24, 52.0.0.0/10, 52.192.0.0/12, 52.208.0.0/13, 52.222.0.0/16, 52.64.0.0/12, 52.84.0.0/14, 54.144.0.0/12, 54.160.0.0/11, 54.192.0.0/12, 54.208.0.0/13, 54.216.0.0/14, 54.220.0.0/15, 54.224.0.0/11, 54.38.0.0/16, 54.64.0.0/11, 63.176.0.0/12, 64.233.160.0/19, 65.8.0.0/14, 66.175.208.0/20, 67.202.0.0/18, 69.192.0.0/16, 72.246.0.0/15, 72.44.32.0/19, 74.125.0.0/16, 74.207.224.0/19, 75.101.128.0/17, 8.0.0.0/13, 8.32.0.0/11, 88.221.68.0/22, 88.221.96.0/22, 92.122.12.0/22, 92.122.68.0/22, 92.123.160.0/21, 92.123.176.0/22, 95.100.224.0/20, 95.100.48.0/20, 95.213.180.0/23, 96.16.0.0/15, 96.6.0.0/15, 98.80.0.0/12, 99.80.0.0/15, 99.83.128.0/17, 99.84.0.0/16, 99.86.0.0/16' },
        { id: 'rutracker', ip: '104.16.0.0/12, 162.158.0.0/15, 172.64.0.0/13, 185.81.128.0/23, 188.114.96.0/22' },
        { id: 'bestchange', ip: '104.16.0.0/12, 138.249.0.0/16, 162.19.0.0/16, 172.64.0.0/13, 185.137.232.0/24, 186.2.165.0/24, 188.124.37.0/24, 188.165.24.0/21, 34.8.0.0/13, 37.9.36.0/22, 5.135.168.224/27, 5.39.61.112/28, 54.36.0.0/15, 94.23.152.0/21, 95.129.232.0/24' },
        { id: 'animego', ip: '104.16.0.0/12, 172.64.0.0/13, 185.178.208.0/22, 49.13.80.0/20' },
		{ id: 'hdrezka', ip: '104.16.0.0/12, 104.247.80.0/22, 13.248.0.0/14, 136.243.0.0/16, 146.255.0.0/16, 152.89.28.0/23, 162.255.116.0/22, 172.224.0.0/12, 172.64.0.0/13, 176.58.38.0/23, 176.58.40.0/24, 176.58.41.0/24, 176.58.42.0/24, 176.58.45.0/24, 176.58.46.0/24, 176.58.48.0/23, 176.58.50.0/24, 176.58.54.0/24, 176.58.56.0/24, 176.58.57.0/24, 178.63.75.0/26, 179.32.0.0/12, 185.190.188.0/24, 185.190.190.0/24, 185.53.177.0/24, 185.53.178.0/24, 199.59.240.0/22, 199.80.52.0/22, 212.124.124.0/25, 212.124.96.0/24, 213.111.160.0/22, 45.10.216.0/23, 5.45.76.0/22, 5.45.84.0/22, 5.9.51.64/27, 54.64.0.0/11, 76.223.0.0/17, 82.221.104.144/29, 82.221.105.0/24, 85.217.222.0/24, 89.105.207.64/26, 91.132.188.0/23, 99.83.128.0/17' },
		{ id: 'rutor', ip: '104.16.0.0/12, 172.64.0.0/13, 188.114.96.0/22, 193.46.255.0/24, 75.2.0.0/17' },
		{ id: 'nnmclub', ip: '104.16.0.0/12, 172.64.0.0/13, 188.114.96.0/22' },
		{ id: 'itch', ip: '104.16.0.0/12, 104.64.0.0/10, 172.64.0.0/13, 173.222.0.0/15, 184.24.0.0/13, 184.50.0.0/15, 184.84.0.0/14, 2.16.10.0/23, 2.16.102.0/23, 2.16.106.0/23, 2.16.154.0/24, 2.16.16.0/23, 2.16.168.0/23, 2.16.170.0/23, 2.16.224.0/19, 2.16.54.0/23, 2.16.56.0/23, 2.16.88.0/23, 2.17.112.0/22, 2.17.251.0/24, 2.18.244.0/22, 2.18.64.0/20, 2.19.0.0/20, 2.19.112.0/20, 2.19.196.0/22, 2.19.204.0/22, 2.19.48.0/20, 2.20.12.0/22, 2.20.242.0/24, 2.20.254.0/23, 2.20.45.0/24, 2.21.0.0/20, 2.21.173.0/24, 2.21.32.0/20, 2.21.64.0/20, 2.22.230.0/23, 2.22.80.0/20, 2.23.144.0/20, 2.23.160.0/20, 2.23.176.0/20, 2.23.224.0/19, 2.23.96.0/20, 209.95.32.0/19, 212.95.165.0/26, 213.155.157.0/24, 23.192.0.0/11, 23.32.0.0/11, 23.72.0.0/13, 35.192.0.0/12, 45.33.0.0/17, 45.79.0.0/16, 5.178.42.128/25, 5.178.43.0/25, 62.115.252.0/24, 62.115.253.0/24, 72.246.0.0/15, 8.0.0.0/13, 8.32.0.0/11, 80.239.138.0/24, 80.67.82.0/24, 87.245.192.0/20, 88.221.128.0/21, 92.122.125.0/24, 92.122.244.0/22, 92.122.92.0/22, 92.123.132.0/22, 92.123.16.0/20, 92.123.180.0/22, 92.123.236.0/22, 93.186.137.128/25, 95.100.104.0/21, 95.100.128.0/20, 95.100.168.0/21, 95.100.176.0/20, 95.100.248.0/24, 95.101.116.0/22, 95.101.136.0/22, 95.101.168.0/21, 95.101.20.0/22, 95.101.24.0/22, 95.101.35.0/24, 95.101.60.0/22, 95.101.72.0/22, 95.101.76.0/22, 95.101.8.0/22, 96.16.0.0/15' },
		{ id: 'telegram', ip: '100.24.0.0/13, 104.16.0.0/12, 108.177.0.0/17, 132.245.0.0/16, 142.250.0.0/15, 146.75.0.0/16, 149.154.160.0/20, 151.101.0.0/16, 170.149.0.0/16, 172.217.0.0/16, 172.253.0.0/16, 172.64.0.0/13, 173.194.0.0/16, 174.143.0.0/16, 178.128.240.0/20, 18.128.0.0/9, 185.76.151.0/24, 188.166.0.0/17, 192.178.0.0/15, 199.232.0.0/16, 204.212.0.0/14, 209.85.128.0/17, 209.97.0.0/18, 213.180.193.0/24, 216.58.192.0/19, 34.192.0.0/10, 34.64.0.0/10, 35.184.0.0/13, 35.224.0.0/12, 35.240.0.0/13, 40.96.0.0/12, 44.192.0.0/10, 50.128.0.0/9, 52.96.0.0/12, 64.233.160.0/19, 66.151.176.0/20, 74.125.0.0/16, 8.0.0.0/13, 8.32.0.0/11, 91.105.192.0/23, 91.108.12.0/22, 91.108.16.0/22, 91.108.20.0/22, 91.108.4.0/22, 91.108.56.0/22, 91.108.8.0/22, 92.204.208.0/20, 95.161.64.0/20' },
		{ id: 'whatsapp', ip: '1.0.0.0/9, 101.48.0.0/13, 101.64.0.0/10, 102.0.0.0/8, 103.0.0.0/14, 103.101.128.0/17, 103.119.0.0/16, 103.120.0.0/16, 103.131.0.0/16, 103.156.0.0/14, 103.160.0.0/11, 103.199.64.0/20, 103.203.88.0/21, 103.21.128.0/18, 103.226.128.0/18, 103.232.128.0/19, 103.234.0.0/17, 103.240.0.0/17, 103.41.0.0/19, 103.63.64.0/18, 103.73.64.0/18, 103.8.0.0/14, 103.97.128.0/18, 105.0.0.0/8, 106.0.0.0/8, 109.173.136.0/21, 109.226.16.128/25, 109.75.52.0/23, 110.0.0.0/11, 110.160.0.0/13, 110.40.0.0/13, 110.93.128.0/17, 111.80.0.0/13, 111.96.0.0/11, 112.0.0.0/8, 113.128.0.0/10, 114.0.0.0/10, 114.136.0.0/13, 114.96.0.0/11, 115.164.0.0/15, 115.64.0.0/11, 116.206.0.0/18, 116.64.0.0/10, 117.128.0.0/9, 117.52.0.0/15, 118.96.0.0/13, 119.16.0.0/12, 119.32.0.0/11, 120.0.0.0/8, 122.0.0.0/10, 122.152.0.0/13, 123.104.0.0/13, 123.128.0.0/10, 123.192.0.0/11, 124.0.0.0/9, 124.208.0.0/12, 128.200.0.0/15, 129.0.0.0/16, 129.134.0.0/16, 131.0.0.0/16, 131.108.0.0/16, 131.161.0.0/16, 131.221.0.0/16, 131.255.0.0/16, 132.245.0.0/16, 132.255.0.0/16, 134.19.0.0/16, 137.59.64.0/18, 138.0.0.0/16, 138.118.128.0/17, 138.121.0.0/16, 138.185.0.0/16, 138.186.0.0/16, 138.219.0.0/16, 138.36.0.0/16, 138.59.0.0/16, 138.97.0.0/16, 138.99.0.0/16, 139.5.32.0/19, 139.5.64.0/19, 140.213.0.0/16, 141.0.0.0/8, 143.0.0.0/16, 143.208.0.0/16, 143.255.0.0/16, 145.255.92.0/22, 149.255.0.0/16, 149.62.0.0/16, 15.196.0.0/14, 150.129.128.0/17, 151.0.0.0/8, 152.255.0.0/16, 154.64.0.0/10, 156.0.0.0/16, 156.38.0.0/16, 157.240.0.0/16, 159.146.0.0/16, 159.224.0.0/16, 160.113.0.0/16, 160.202.144.0/21, 161.0.0.0/16, 162.221.212.0/22, 163.70.128.0/17, 165.169.0.0/16, 165.56.0.0/16, 167.142.0.0/16, 168.0.0.0/16, 168.121.0.0/16, 168.181.0.0/16, 168.194.0.0/16, 168.196.0.0/16, 168.197.0.0/16, 168.253.0.0/16, 168.90.0.0/16, 169.239.0.0/16, 170.150.0.0/16, 170.231.0.0/16, 170.233.0.0/16, 170.238.0.0/16, 170.245.0.0/19, 170.246.128.0/17, 170.250.0.0/16, 170.52.48.0/21, 170.78.0.0/16, 170.80.0.0/16, 170.83.0.0/16, 170.84.128.0/18, 170.84.192.0/19, 171.128.0.0/9, 171.96.0.0/11, 172.93.16.0/20, 175.0.0.0/10, 175.96.0.0/13, 176.240.128.0/17, 176.28.128.0/17, 176.58.72.0/24, 177.10.0.0/15, 177.128.0.0/10, 177.16.0.0/12, 177.192.0.0/12, 177.220.0.0/15, 177.223.0.0/16, 177.224.0.0/11, 177.32.0.0/11, 177.64.0.0/12, 177.80.0.0/13, 177.88.0.0/14, 177.92.0.0/16, 177.96.0.0/11, 178.88.114.128/26, 179.0.0.0/11, 179.128.0.0/11, 179.176.0.0/13, 179.184.0.0/14, 179.189.0.0/17, 179.192.0.0/10, 179.32.0.0/12, 179.48.0.0/13, 179.60.0.0/16, 179.62.0.0/15, 179.64.0.0/10, 18.128.0.0/9, 180.149.48.0/20, 180.192.0.0/11, 181.0.0.0/11, 181.116.0.0/14, 181.128.0.0/10, 181.32.0.0/13, 181.64.0.0/11, 182.0.0.0/9, 182.176.0.0/12, 182.192.0.0/10, 183.0.0.0/8, 185.11.11.0/24, 185.143.124.0/22, 185.173.60.0/22, 185.191.52.0/22, 185.2.96.0/22, 185.27.106.0/24, 185.47.188.0/22, 185.48.240.0/24, 185.54.255.128/26, 185.58.68.0/24, 185.60.216.0/22, 185.76.178.0/24, 185.78.131.128/26, 185.78.131.64/26, 185.81.140.0/23, 185.81.33.0/24, 185.82.96.0/24, 185.85.152.0/23, 185.89.218.0/23, 186.0.0.0/15, 186.128.0.0/9, 186.16.0.0/12, 186.2.128.0/19, 186.32.0.0/11, 186.4.0.0/14, 186.64.0.0/10, 186.8.0.0/13, 187.0.0.0/11, 187.128.0.0/9, 187.32.0.0/16, 187.36.0.0/14, 187.48.0.0/12, 187.64.0.0/10, 188.0.149.0/24, 188.137.0.0/17, 188.247.240.0/21, 188.64.201.0/24, 189.0.0.0/12, 189.128.0.0/9, 189.32.0.0/11, 189.64.0.0/10, 190.0.0.0/10, 190.104.0.0/15, 190.107.0.0/16, 190.108.0.0/14, 190.122.0.0/16, 190.123.8.0/21, 190.124.0.0/14, 190.128.0.0/10, 190.211.0.0/17, 190.212.0.0/14, 190.216.0.0/13, 190.80.0.0/13, 190.88.0.0/14, 190.94.0.0/15, 190.96.0.0/14, 191.0.0.0/10, 191.100.0.0/16, 191.102.0.0/15, 191.128.0.0/9, 192.114.144.0/22, 192.124.220.0/24, 192.254.96.0/20, 193.135.136.0/24, 193.212.0.0/15, 193.95.0.0/17, 193.95.164.192/26, 195.12.160.0/19, 195.122.31.128/26, 195.13.189.64/26, 195.162.80.0/22, 195.174.0.0/15, 195.222.47.0/24, 195.229.0.0/16, 195.250.64.0/19, 195.5.48.0/20, 196.128.0.0/9, 197.0.0.0/8, 198.231.28.0/22, 200.0.0.0/10, 200.128.0.0/11, 200.160.0.0/15, 200.176.0.0/12, 200.192.0.0/14, 200.198.0.0/15, 200.208.0.0/12, 200.69.64.0/18, 200.72.0.0/13, 200.80.0.0/12, 200.96.0.0/11, 201.0.0.0/11, 201.128.0.0/12, 201.148.0.0/17, 201.152.0.0/13, 201.160.0.0/11, 201.192.0.0/10, 201.47.0.0/16, 201.48.0.0/16, 201.52.0.0/14, 201.56.0.0/13, 201.80.0.0/12, 202.128.0.0/14, 202.136.0.0/13, 202.152.0.0/13, 202.164.128.0/18, 202.176.0.0/14, 202.184.0.0/13, 202.51.79.0/24, 202.64.0.0/14, 202.70.0.0/16, 202.71.0.0/22, 202.72.0.0/14, 202.88.0.0/16, 202.90.0.0/15, 202.93.0.0/16, 203.104.0.0/14, 203.109.128.0/17, 203.112.0.0/12, 203.128.0.0/12, 203.184.0.0/14, 203.192.0.0/10, 203.52.0.0/15, 203.72.0.0/14, 203.76.0.0/15, 203.78.0.0/17, 203.82.0.0/15, 203.99.0.0/16, 204.110.56.0/21, 204.186.0.0/16, 204.236.64.0/18, 207.194.0.0/16, 207.228.128.0/18, 207.229.128.0/18, 207.70.128.0/18, 208.104.0.0/16, 208.66.48.0/21, 209.104.64.0/18, 209.146.0.0/17, 209.148.128.0/17, 209.52.0.0/15, 209.59.64.0/18, 209.91.64.0/18, 210.0.0.0/7, 212.112.117.224/27, 212.113.184.0/22, 212.120.241.0/24, 212.145.0.0/16, 212.154.111.0/24, 212.199.140.0/24, 212.2.96.0/19, 212.217.0.0/17, 212.232.96.0/20, 212.30.0.0/19, 212.43.8.0/21, 212.47.128.0/19, 212.52.128.0/19, 212.56.132.0/23, 212.65.152.0/23, 212.65.158.0/23, 212.68.192.0/20, 212.68.208.0/20, 212.95.183.192/26, 212.96.64.0/19, 213.150.160.0/19, 213.157.192.0/19, 213.180.193.0/24, 213.202.0.0/21, 213.204.119.0/24, 213.230.52.0/22, 213.52.0.0/17, 213.57.0.0/17, 213.94.76.0/24, 216.177.160.0/19, 217.168.6.0/23, 217.168.80.0/20, 217.22.184.0/22, 217.25.24.0/23, 217.64.96.0/20, 217.73.140.0/23, 217.76.71.0/24, 217.79.128.0/21, 219.0.0.0/8, 222.128.0.0/11, 223.128.0.0/9, 223.27.128.0/17, 24.200.0.0/14, 24.222.0.0/16, 24.236.64.0/18, 24.244.0.0/18, 24.55.64.0/18, 27.64.0.0/11, 3.0.0.0/9, 3.128.0.0/9, 31.13.64.0/18, 31.145.0.0/16, 31.3.93.0/24, 36.0.0.0/9, 37.152.0.0/22, 37.238.0.0/16, 37.26.80.0/23, 40.96.0.0/12, 41.0.0.0/8, 42.0.0.0/8, 43.224.0.0/16, 43.230.128.0/21, 43.245.96.0/20, 43.246.0.0/15, 43.252.0.0/20, 45.112.176.0/20, 45.113.128.0/18, 45.118.240.0/21, 45.121.128.0/17, 45.160.0.0/12, 45.178.0.0/15, 45.224.0.0/14, 45.228.0.0/15, 45.232.0.0/13, 45.6.64.0/18, 45.64.0.0/16, 45.7.0.0/16, 46.1.124.0/23, 46.196.0.0/16, 46.197.0.0/18, 46.99.249.0/24, 49.224.0.0/13, 49.32.0.0/11, 49.64.0.0/10, 5.104.2.0/24, 5.20.0.0/21, 5.22.176.0/20, 51.39.0.0/16, 52.96.0.0/12, 54.160.0.0/11, 54.224.0.0/11, 57.0.0.0/8, 58.128.0.0/9, 58.16.0.0/12, 59.153.128.0/17, 59.153.64.0/18, 59.160.0.0/11, 60.0.0.0/8, 62.0.0.0/16, 62.1.0.0/16, 62.197.192.0/18, 62.209.24.0/21, 62.24.128.0/17, 62.251.128.0/17, 62.4.128.0/17, 62.74.63.0/26, 62.75.0.0/19, 62.8.64.0/19, 62.84.0.0/20, 63.143.64.0/18, 64.119.192.0/20, 64.66.0.0/20, 65.192.0.0/11, 65.48.128.0/17, 66.128.160.0/19, 66.201.160.0/19, 66.50.0.0/16, 66.8.0.0/17, 66.97.224.0/19, 67.218.80.0/20, 69.92.0.0/16, 70.160.0.0/11, 72.136.0.0/13, 72.192.0.0/11, 74.118.80.0/22, 74.50.208.0/21, 77.136.0.0/16, 77.224.0.0/13, 77.237.0.0/21, 77.243.16.0/21, 77.52.0.0/24, 78.154.160.0/19, 78.159.164.0/22, 78.8.0.0/14, 79.101.112.0/23, 80.76.170.0/23, 81.167.36.0/23, 81.192.0.0/16, 81.196.173.128/26, 81.196.26.128/25, 82.199.192.0/20, 82.76.231.128/26, 82.76.231.192/26, 82.78.186.128/26, 82.78.186.192/26, 82.78.68.0/26, 82.78.68.64/26, 82.85.13.128/26, 82.85.19.0/26, 82.85.43.0/26, 83.119.16.0/20, 83.174.0.0/18, 83.255.224.0/21, 84.15.0.0/16, 84.208.7.0/24, 84.22.34.96/28, 84.91.172.0/24, 85.114.48.0/23, 85.114.96.0/19, 86.110.224.97/32, 86.127.118.0/23, 86.56.128.0/24, 87.201.168.0/21, 87.235.208.0/20, 88.212.9.0/24, 88.216.174.0/24, 89.108.140.0/22, 89.45.2.0/23, 90.244.152.0/21, 91.185.14.0/24, 91.225.200.0/22, 92.63.8.0/21, 92.80.0.0/13, 93.103.0.0/16, 93.191.8.128/26, 93.57.114.0/24, 93.57.122.0/24, 93.57.123.0/24, 93.62.101.0/24, 93.91.192.0/22, 94.153.128.0/17, 94.198.177.0/24, 94.76.104.0/21, 94.79.192.0/19, 94.96.0.0/14, 95.107.145.0/24, 95.209.200.0/21, 95.94.0.0/15' }
		//{ id: '', ip: '' },//
	];

    const selectedSites = sites.filter(site => document.getElementById(site.id).checked);
    const ipv6Toggle = document.getElementById('ipv6');
	
    if (selectedSites.length === 0) {
		if (ipv6Toggle.checked) {return "0.0.0.0/0, ::/0"} else {return "0.0.0.0/0"} // default 
    } else {
        const ips = selectedSites.map(site => site.ip).join(', ');
        return ips; 
    }
}

const modal = document.getElementById("infoModal");
const modal2 = document.getElementById("infoModal2");
const infoBtn = document.getElementById("infoButton");
const infoBtn2 = document.getElementById("infoButton2");
const infoBtn3 = document.getElementById("infoButton3");
const span = document.getElementsByClassName("close")[0];
const span2 = document.getElementsByClassName("close")[1];

function lockBodyScroll() {
    document.body.style.overflow = 'hidden';
}

// Функция для разблокировки прокрутки body
function unlockBodyScroll() {
    document.body.style.overflow = '';
}

// Функция для открытия модального окна
function openModal() {
    modal.style.display = "block";
    lockBodyScroll(); 
}

function openModal2() {
    modal2.style.display = "block";
    lockBodyScroll(); 
}

// AmneziaWG
infoBtn.onclick = openModal;

// WireSock
if (infoBtn2) {
    infoBtn2.onclick = openModal;
}

// Clash
if (infoBtn3) {
    infoBtn3.onclick = openModal2;
}

// Закрытие по клику на крестики
span.onclick = function() {
    modal.style.display = "none";
    unlockBodyScroll(); 
}

span2.onclick = function() {
	modal2.style.display = "none";
    unlockBodyScroll(); 
}

// Закрытие по клику вне модального окна
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        unlockBodyScroll();
    };
	
	if (event.target == modal2) {
		modal2.style.display = "none";
        unlockBodyScroll();
    }
}

// Функция для проверки выбранных сайтов и управления toggle
function updateToggleState() {
    const toggleCheckbox = document.getElementById('rules');
    const siteCheckboxes = document.querySelectorAll('.Sites .payment-radio');
    
    // Проверяем, выбран ли хотя бы один чекбокс сайта
    let isAnySiteChecked = false;
    siteCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            isAnySiteChecked = true;
        }
    });
    
    // Если выбран хотя бы один сайт, отключаем toggle и сбрасываем его
    if (isAnySiteChecked) {
        toggleCheckbox.disabled = true;
        toggleCheckbox.checked = false; // Сбрасываем toggle
    } else {
        toggleCheckbox.disabled = false;
    }
}

// Добавляем обработчики для всех чекбоксов сайтов
document.addEventListener('DOMContentLoaded', function() {
    const siteCheckboxes = document.querySelectorAll('.Sites .payment-radio');
    
    siteCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateToggleState);
    });
    
    // Инициализация при загрузке страницы
    updateToggleState();
});



// Функция для проверки, является ли выбранный DNS блокирующим
function isBlockingDNS() {
    const blockingDNS = ['comss', 'geohide', 'xbox', 'malw'];
    const selectedDNS = getSelectedDNSRadio();
    return blockingDNS.includes(selectedDNS);
}

// Функция для получения ID выбранного DNS
function getSelectedDNSRadio() {
    const dnsRadios = document.querySelectorAll('input[name="payment"]');
    for (let radio of dnsRadios) {
        if (radio.checked) {
            return radio.id;
        }
    }
    return null;
}

// Функция для проверки, является ли радио-кнопка DNS
function isDNSRadio(radio) {
    return radio.getAttribute('name') === 'payment';
}

// Функция для сброса выбранных сайтов
function resetSelectedSites() {
    const siteCheckboxes = document.querySelectorAll('input[name="sites"]');
    siteCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            checkbox.checked = false;
            
            // Обновляем визуальное состояние
            const parentOption = checkbox.closest('.payment-option');
            if (parentOption) {
                parentOption.classList.remove('payment-option--checked');
            }
        }
    });
    
    // Обновляем состояние toggle после сброса сайтов
    if (typeof updateToggleState === 'function') {
        updateToggleState();
    }
}

// Функция для обновления состояния радио-кнопок
function updateRadioButtonsState() {
    const isBlocking = isBlockingDNS();
    const serverRadios = document.querySelectorAll('input[name="server"]');
    const serverOptions = document.querySelectorAll('.server-option');
    const siteOptions = document.querySelectorAll('.Sites .payment-option');
    const siteCheckboxes = document.querySelectorAll('input[name="sites"]');
    

    serverRadios.forEach(radio => {
        radio.disabled = isBlocking;
    });
    
    serverOptions.forEach(option => {
        if (isBlocking) {
            option.style.opacity = '0.5';
            option.style.cursor = 'not-allowed';
            option.style.pointerEvents = 'none';
        } else {
            option.style.opacity = '';
            option.style.cursor = '';
            option.style.pointerEvents = 'auto';
        }
    });
    

    siteCheckboxes.forEach(checkbox => {
        checkbox.disabled = isBlocking;
    });
    
    siteOptions.forEach(option => {
        if (isBlocking) {
            option.style.opacity = '0.5';
            option.style.cursor = 'not-allowed';
            option.style.pointerEvents = 'none';
        } else {
            option.style.opacity = '';
            option.style.cursor = '';
            option.style.pointerEvents = 'auto';
        }
    });
    
    // Для payment-опций (DNS) только меняем внешний вид, но не блокируем
    const paymentOptions = document.querySelectorAll('.dnsinfo .payment-option');
    paymentOptions.forEach(option => {
        const radio = option.querySelector('input');
        if (radio && isDNSRadio(radio)) {
            // DNS радио всегда доступны
            option.style.opacity = '1';
            option.style.cursor = 'pointer';
            option.style.pointerEvents = 'auto';
        }
    });
}

// Функция для сброса сервера на стандартный без блокировки возможности выбора
function resetServerToDefault() {
    const defaultServer = document.getElementById('def');
    if (defaultServer) {
        defaultServer.checked = true;
        document.querySelectorAll('.server-option').forEach(option => {
            option.classList.remove('server-option--checked');
        });
        
        const parentOption = defaultServer.closest('.server-option');
        if (parentOption) {
            parentOption.classList.add('server-option--checked');
        }
    }
}

// Добавляем обработчики для всех DNS радио-кнопок
document.addEventListener('DOMContentLoaded', function() {
    const dnsRadios = document.querySelectorAll('input[name="payment"]');
    
    dnsRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Если выбран блокирующий DNS
            if (isBlockingDNS()) {

                resetServerToDefault();
                resetSelectedSites();
                
                // Сбрасываем все остальные payment-радио (кроме текущего)
                dnsRadios.forEach(otherRadio => {
                    if (otherRadio !== radio && otherRadio.checked) {
                        otherRadio.checked = false;
                        
                        // Обновляем визуальное состояние для сброшенных опций
                        const parentOption = otherRadio.closest('.payment-option');
                        if (parentOption) {
                            parentOption.classList.remove('payment-option--checked');
                        }
                    }
                });
            }
            updateRadioButtonsState();
        });
    });
    updateRadioButtonsState();
	
    // Добавляем обработчики для server-радио, чтобы они нормально работали после разблокировки
    const serverRadios = document.querySelectorAll('input[name="server"]');
    serverRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Обновляем визуальное состояние при выборе сервера
            document.querySelectorAll('.server-option').forEach(option => {
                option.classList.remove('server-option--checked');
            });
            
            const parentOption = this.closest('.server-option');
            if (parentOption) {
                parentOption.classList.add('server-option--checked');
            }
        });
    });
});

  const textarea = document.getElementById('keepalive');
  textarea.addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '');
  });
  textarea.addEventListener('paste', function(e) {
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    if (!/^\d*$/.test(pastedText)) {
      e.preventDefault();
    }
  });
  textarea.addEventListener('keydown', function(e) {
    const controlKeys = [
      'Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'PageUp', 'PageDown'
    ];
    if (controlKeys.includes(e.key)) return;
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  });


const keepToggle = document.getElementById('keeptogggle');
const keepaliveContainer = document.querySelector('.keepalive-container');
if (keepToggle && keepaliveContainer) {
    if (keepToggle.checked) {
        keepaliveContainer.classList.add('visible');
    } else {
        keepaliveContainer.classList.remove('visible');
    }
    keepToggle.addEventListener('change', function() {
        if (this.checked) {
            keepaliveContainer.classList.add('visible');
        } else {
            keepaliveContainer.classList.remove('visible');
        }
    });
}

const i1Toggle = document.getElementById('i1toggle');
const i1textarea = document.querySelector('.i1');
if (i1Toggle && i1textarea) {
    if (i1Toggle.checked) {
        i1textarea.classList.add('visible');
    } else {
        i1textarea.classList.remove('visible');
    }
    i1Toggle.addEventListener('change', function() {
        if (this.checked) {
            i1textarea.classList.add('visible');
        } else {
            i1textarea.classList.remove('visible');
        }
    });
}

// Дополнительные настройки (сворачиваемый блок)
const optionsToggle = document.getElementById('optionsToggle');
const optionsDiv = document.getElementById('optionsDiv');
const optionsArrow = document.getElementById('optionsArrow');

if (optionsToggle && optionsDiv && optionsArrow) {
    optionsToggle.addEventListener('click', function() {
        optionsDiv.classList.toggle('show');
        
        if (optionsDiv.classList.contains('show')) {
            optionsArrow.style.transform = 'rotate(180deg)';
        } else {
            optionsArrow.style.transform = 'rotate(0deg)';
        }
    });
}

const textarea1 = document.querySelector('.i2');
textarea1.addEventListener('input', function () {
  this.style.height = 'auto'; // Сброс для уменьшения при удалении текста
  this.style.height = (this.scrollHeight) + 'px'; // Установка высоты по контенту
});

// ========== QUIC генератор ==========
async function generateQuicMask() {
    const sniInput = document.getElementById('i1');
    const i1Toggle = document.getElementById('i1toggle');
    const i2area = document.getElementById('i2');
    
    if (!i1Toggle || !i1Toggle.checked) {
        i2area.style.display = 'none';
        return;
    }

    i2area.style.display = 'block';
    
    let sni = sniInput.value.trim();
    
    if (!sni) {
        i2area.value = '';
		i2area.style.display = 'none';
        return;
    }
    
    const level = 4; // ---------------------
    const dcid = new Uint8Array(1);
    window.crypto.getRandomValues(dcid);
    const scid = new Uint8Array(0);
    const token = new Uint8Array(0);
    const pkn = new Uint8Array([0]);
    
    const clientHello = quicTlsClientHelloSniOnly(sni);
    const [payload, cutSettings] = quicTlsClientHelloToFrames(clientHello, level);
    const packet = await quicInitial(dcid, scid, token, pkn, payload, 0);
    quicFixCutSettings(cutSettings, packet.byteLength, pkn.byteLength, payload.byteLength);
    const hexResult = quicToHex(packet);
    
    i2area.value = `I1 = <b 0x${hexResult}>`;
	i2area.style.height = 'auto';
    i2area.style.height = i2area.scrollHeight + 'px';
}

const i1Input = document.getElementById('i1');
i1Input.addEventListener('input', generateQuicMask);
i1Toggle.addEventListener('change', generateQuicMask);
document.getElementById('i2').style.display = 'none';
document.addEventListener('DOMContentLoaded', function() {
  
// Блокировка Enter
const textareas = document.querySelectorAll('textarea');
    
    textareas.forEach(textarea => {
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); 
                this.blur();
            }
        });
    });
}); //
