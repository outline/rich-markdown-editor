"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtectedImageZoom = void 0;
const React = __importStar(require("react"));
const lodash_1 = require("lodash");
const react_medium_image_zoom_1 = __importDefault(require("react-medium-image-zoom"));
const fetchProtectedFile_1 = __importDefault(require("../lib/fetchProtectedFile"));
class ProtectedImageZoom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            imageUrl: "",
        };
    }
    async componentDidMount() {
        const imageBlob = await fetchProtectedFile_1.default(this.props.image.src);
        const imageUrl = URL.createObjectURL(imageBlob);
        this.setState({
            imageUrl,
        });
        return Promise.resolve();
    }
    render() {
        const { image, title } = this.props;
        const { imageUrl } = this.state;
        const omittedProps = lodash_1.omit(this.props, "image");
        return (React.createElement(react_medium_image_zoom_1.default, Object.assign({ image: {
                src: imageUrl,
                alt: image.alt,
                className: image.className,
                style: image.style,
                title: title,
                onload: () => URL.revokeObjectURL(imageUrl),
            } }, omittedProps)));
    }
}
exports.ProtectedImageZoom = ProtectedImageZoom;
//# sourceMappingURL=ProtectedImageZoom.js.map