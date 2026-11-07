# Incident Report Ticket #8992
**Date:** 2026-10-10 09:30 AM
**Reporter:** Customer Service Team
**Status:** High Severity

**Description:**
Hàng loạt đơn hàng trên hệ thống e-commerce bị kẹt ở trạng thái "Processing" từ tối hôm qua. Khách hàng đã thanh toán nhưng không nhận được email xác nhận đơn hàng.

**DevOps Note (Tuan Pham - 10:00 AM):**
Đã kiểm tra hệ thống. Team A (Checkout Team) báo cáo rằng Kafka consumer `order-processing-group` đang subscribe vào topic `payment-events` bị lag nghiêm trọng. Log ghi nhận liên tục lỗi "Avro Deserialization Error: Unknown field". Kafka lag đã vượt quá 100,000 messages. Đang tìm hiểu nguyên nhân lỗi parse data này.