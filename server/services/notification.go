package services

import (
	"context"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/rabbitmq"
	amqp "github.com/rabbitmq/amqp091-go"
)

type Notification struct {
	rabbit  *rabbitmq.RabbitMQ
}
type NotificationHub struct {
	rabbit  *rabbitmq.RabbitMQ
	message chan amqp.Delivery
	stop    chan bool
}

func(n * Notification) NewHub()*NotificationHub{
	return &NotificationHub{
			rabbit: n.rabbit,
			message: make(chan amqp.Delivery),
			stop: make(chan bool),
	}
}
func (hub * NotificationHub) ListenByRoutingKey(routingKey string, context context.Context) error {
	err := hub.rabbit.Channel.ExchangeDeclare(
		"notification",      // name
		amqp.ExchangeDirect, // type
		true,                // durable
		false,               // auto-deleted
		false,               // internal
		false,               // no-wait
		nil,                 // arguments
	)
	if err != nil {
		return err
	}

	queue, err := hub.rabbit.Channel.QueueDeclare(
		"",    // queue name"
		false, // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,
	)

	if err != nil {
		return err

	}
	err = hub.rabbit.Channel.QueueBind(
		queue.Name,     // queue name
		routingKey,     // routing key
		"notification", // exchange
		false,
		nil,
	)
	if err != nil {
		return err
	}

	messages, consumeErr := hub.rabbit.Channel.Consume(
		queue.Name, // queue name
		"",         // consumer
		true,       // auto-ack
		false,      // exclusive
		false,      // no local
		false,      // no wait
		nil,        // arguments
	)

	if consumeErr != nil {
		return consumeErr
	}
	/*
		First case checks if context.Cancel is called then exit;
		Second case check if there is a message and broadcast to message channel
	*/
	for {
		
		select {
		case <-context.Done():
			hub.rabbit.Channel.QueueUnbind(queue.Name, routingKey, "notification", nil)
			return nil
		case d, ok := <-messages:
			if !ok {
				hub.stop <- true
				return nil
			}
			hub.message <- d
		}

	}

}
func (hub *NotificationHub) Message() <-chan amqp.Delivery {
	return hub.message

}
func (hub *NotificationHub) Stop() <-chan bool {
	return hub.stop
}
func NewNotificationService() NotificationService{
	rabbit := rabbitmq.CreateOrGetInstance()
	return &Notification{
		rabbit:  rabbit,
	}
}
type NotificationService interface {
	NewHub()*NotificationHub
}
