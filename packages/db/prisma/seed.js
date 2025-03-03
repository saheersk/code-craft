"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const language_1 = require("@repo/common/language");
(() => __awaiter(void 0, void 0, void 0, function* () {
    return yield src_1.prismaClient.language.createMany({
        data: Object.keys(language_1.LANGUAGE_MAPPING).map((language) => ({
            id: language_1.LANGUAGE_MAPPING[language].internal,
            name: language,
            judge0Id: language_1.LANGUAGE_MAPPING[language].executor,
        })),
    });
}))();
