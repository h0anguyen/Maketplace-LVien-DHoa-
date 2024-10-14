import prisma from "@models";
import { Request, Response } from "express";
import {
  BuildPaymentUrl,
  BuildPaymentUrlOptions,
  dateFormat,
  InpOrderAlreadyConfirmed,
  IpnFailChecksum,
  IpnOrderNotFound,
  IpnSuccess,
  IpnUnknownError,
  ProductCode,
  ReturnQueryFromVNPay,
  VerifyReturnUrl,
  VnpCurrCode,
  VnpLocale,
} from "vnPay";
import { ApplicationController } from ".";
import vnpay from "../../configs/vnpay";

export class PaymentController extends ApplicationController {
  public async payment(req: Request, res: Response) {
    const { orderId, totalAmount } = req.body;
    const order = await prisma.orders.findUnique({
      where: {
        id: parseInt(orderId),
      },
      select: {
        createdAt: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!orderId || !totalAmount) {
      return res
        .status(400)
        .send("Thiếu thông tin đơn hàng hoặc tổng số tiền.");
    }

    const data: BuildPaymentUrl = {
      vnp_Amount: totalAmount * 1000,
      vnp_IpAddr:
        req.headers.forwarded ||
        req.ip ||
        req.socket.remoteAddress ||
        req.connection.remoteAddress ||
        "127.0.0.1",
      vnp_OrderInfo: `Thanh toan do hang ${orderId}`,
      vnp_ReturnUrl: "http://localhost:8000/payment/vnpay-return",
      vnp_TxnRef: orderId,
      vnp_Locale: VnpLocale.VN,
      vnp_OrderType: ProductCode.Other,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_CurrCode: VnpCurrCode.VND,
    };
    const url = vnpay.buildPaymentUrl(data, {
      withHash: true,
    } as BuildPaymentUrlOptions<any>);
    return res.redirect(url);
  }

  public async paymentIpn(req: Request, res: Response) {
    try {
      const verify: VerifyReturnUrl = vnpay.verifyIpnCall(
        req.query as ReturnQueryFromVNPay
      );
      if (!verify.isVerified) {
        return res.json(IpnFailChecksum);
      }
      const order = await prisma.orders.findUnique({
        where: { id: parseInt(verify.vnp_TxnRef) },
      });
      if (!order || verify.vnp_TxnRef !== String(order.id)) {
        return res.json(IpnOrderNotFound);
      }

      // Nếu đơn hàng đã được xác nhận trước đó
      if (order.status === "ACCEPTED") {
        return res.json(InpOrderAlreadyConfirmed);
      }

      await prisma.orders.update({
        where: { id: order.id },
        data: { status: "ACCEPTED" },
      });
      // Cập nhật trạng thái về cho VNPay biết rằng bạn đã xác nhận đơn hàng
      return res.json(IpnSuccess);
    } catch (error) {
      /**
       * Xử lí lỗi ngoại lệ
       * Ví dụ như không đủ dữ liệu, dữ liệu không hợp lệ, cập nhật database thất bại
       */
      console.log(`verify error: ${error}`);
      return res.json(IpnUnknownError);
    }
  }
  public async paymentReturn(req: Request, res: Response) {
    let verify: VerifyReturnUrl;
    try {
      verify = vnpay.verifyReturnUrl(req.query as ReturnQueryFromVNPay);
      if (!verify.isVerified) {
        return res.send("Xác thực tính toàn vẹn dữ liệu không thành công");
      }
      if (!verify.isSuccess) {
        return res.send("Đơn hàng thanh toán không thành công");
      }
    } catch (error) {
      return res.send("Dữ liệu không hợp lệ");
    }
    // Kiểm tra thông tin đơn hàng và xử lý
    return res.render("userview/order.view/success");
  }
  public async index(req: Request, res: Response) {
    return res.render("userview/order.view/success");
  }
}
