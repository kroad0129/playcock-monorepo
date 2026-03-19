package com.playcock.global.config;

import com.playcock.session.websocket.SessionRedisSubscriber;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.*;
import org.springframework.data.redis.listener.*;

@Configuration
@RequiredArgsConstructor
public class RedisSubscriberConfig {

    private final RedisConnectionFactory connectionFactory;
    private final SessionRedisSubscriber subscriber;

    @Bean
    public RedisMessageListenerContainer redisContainer() {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);

        container.addMessageListener(subscriber, new PatternTopic("session:*"));

        return container;
    }
}