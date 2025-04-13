// Constants for resource types and their handling rules
export const RESOURCE_TYPES = {
	css: { folder: "css", extension: ".css", sameDomainOnly: false },
	js: { folder: "js", extension: ".js", sameDomainOnly: true },
	image: { folder: "images", extension: null, sameDomainOnly: false },
	font: { folder: "fonts", extension: null, sameDomainOnly: false },
	video: { folder: "videos", extension: null, sameDomainOnly: true }
};

// Default settings
export const DEFAULT_SETTINGS = {
	maxResourceSize: 30,
	maxTotalSize: 120,
	downloadCss: true,
	downloadJs: true,
	downloadImages: true,
	downloadFonts: true,
	downloadVideos: true
};
