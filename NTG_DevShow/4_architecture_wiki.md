# Architecture Specs: Checkout System
**Document Owner:** Team A

Hệ thống xử lý đơn hàng (Order Processing) của chúng ta hoạt động theo cơ chế event-driven. 
1. Khi khách hàng thanh toán xong, hệ thống sẽ lắng nghe các events từ topic `payment-events` trên Kafka.
2. Nếu Kafka Consumer của chúng ta xử lý thất bại 1 message (ví dụ lỗi logic hoặc lỗi data format) quá 3 lần liên tiếp, hệ thống sẽ vứt message đó vào một Dead Letter Queue.
3. Khi có tin nhắn rơi vào Dead Letter Queue, một service chạy ngầm tên là `Legacy-Retry-Service` sẽ được kích hoạt.
4. Nhiệm vụ của `Legacy-Retry-Service` là liên tục query trực tiếp vào Main SQL Server để đồng bộ lại trạng thái của đơn hàng một cách thủ công (cơ chế cũ chưa được đập bỏ).