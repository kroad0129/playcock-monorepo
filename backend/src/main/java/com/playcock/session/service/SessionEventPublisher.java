package com.playcock.session.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

/**
 * 경기 시작/종료 등의 세션 상태 변경 이벤트 발생 시 
 * Redis Pub/Sub 채널로 메시지를 발행(Publish)하는 역할을 합니다.
 * 
 * 발행된 메시지는 Subscriber가 받아 처리하고,
 * 최종적으로 WebSocket을 통해 실시간으로 운영진 화면 등에 전파됩니다.
 */
@Component
@RequiredArgsConstructor
public class SessionEventPublisher {

    private final StringRedisTemplate redisTemplate;

    /**
     * 특정 세션에 변경이 일어났음을 알리는 이벤트를 발행합니다.
     * 채널명: "session:{sessionId}"
     *
     * @param sessionId 상태가 변경된 세션의 ID
     */
    public void publish(Long sessionId) {
        redisTemplate.convertAndSend("session:" + sessionId, sessionId.toString());
    }
}