// src/services/vnpay/index.ts

import env from "@configs/env";
import { VNPay } from "vnPay";

const vnpay = new VNPay({
  tmnCode: env.tmnCode as string,
  secureSecret: env.secretKey as string,
  enableLog: true,
});

export default vnpay;
