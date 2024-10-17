declare module "sub-vn" {
  export function getAreas(): any;
  export function getProvinces(): any;
  export function getDistricts(): any;
  export function getWards(): any;
  export function getAreasWithDetail(): any;
  export function getProvincesWithDetail(): any;
  export function getProvindByAreaCode(areaCode): any;
  export function getDistrictsByProvinceCode(provinceCode): any;
  export function getWardsByDistrictCode(districtCode): any;
  export function getWardsByProvinceCode(provinceCode): any;
  export function getWardsByCode(wardCode): any;
  export function getCityByCode(cityCode): any;
  export function getDistrictByCode(districtCode): any;
  export function getCodeByDistrict(districtName, provinceName): any;
  export function getCodeByWard(ward, city): any;
  export function getCodeProvince(provinceName): any;
}
