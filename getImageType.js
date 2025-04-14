function getImageType(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = function (event) {
			const arr = (new Uint8Array(event.target.result)).subarray(0, 4);
			let header = "";
			for (let i = 0; i < arr.length; i++) {
				header += arr[i].toString(16);
			}

			let type;
			switch (header) {
				case "89504e47":
					type = "image/png";
					break;
				case "47494638":
					type = "image/gif";
					break;
				case "ffd8ffe0":
				case "ffd8ffe1":
				case "ffd8ffe2":
				case "ffd8ffe3":
				case "ffd8ffe8":
					type = "image/jpeg";
					break;
				case "424d":
					type = "image/bmp";
					break;
				default:
					type = "unknown";
					break;
			}
			resolve(type);
		};

		reader.onerror = function (error) {
			reject(error);
		};
		reader.readAsArrayBuffer(file);
	});
}
