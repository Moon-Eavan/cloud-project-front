import { useState } from 'react'
import styled from 'styled-components'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import apiClient from './lib/apiClient.js'
import './App.css'

const Page = styled.main`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const Panel = styled.section`
  width: min(720px, 100%);
  background: rgba(15, 23, 42, 0.85);
  border-radius: 1.5rem;
  border: 1px solid rgba(148, 163, 184, 0.15);
  padding: 2.5rem;
  box-shadow: 0 20px 65px rgba(15, 23, 42, 0.55);
`;

const Logos = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 2rem;

  img {
    height: 5rem;
    transition: transform 300ms ease;
  }

  img:hover {
    transform: rotate(6deg) scale(1.05);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const PrimaryButton = styled.button`
  flex: 1;
  min-width: 180px;
  border-radius: 999px;
  border: 0;
  padding: 0.85rem 1.75rem;
  font-weight: 600;
  background: linear-gradient(120deg, #7c3aed, #ec4899);
  color: #fff;
  cursor: pointer;
  transition: opacity 200ms ease;

  &:hover {
    opacity: 0.85;
  }
`;

const SecondaryButton = styled(PrimaryButton)`
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.4);
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  margin-top: 1rem;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(15, 23, 42, 0.6);

  &::before {
    content: '';
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--status-color, #fbbf24);
  }
`;

const statusLabelMap = {
  idle: '대기 중',
  loading: '백엔드 연결 확인 중...',
  ok: '백엔드 연결 성공',
  error: '백엔드 연결 실패',
};

const statusColorMap = {
  idle: '#fbbf24',
  loading: '#38bdf8',
  ok: '#34d399',
  error: '#f87171',
};

function App() {
  const [count, setCount] = useState(0)
  const [apiStatus, setApiStatus] = useState('idle')

  const increment = () => setCount((prev) => prev + 1)

  // Basic backend connectivity probe that can be wired to the real API later on.
  const pingBackend = async () => {
    setApiStatus('loading')
    try {
      const { data } = await apiClient.get('/health')
      setApiStatus(data?.status ? 'ok' : 'error')
    } catch (error) {
      console.error('[api] health check failed', error)
      setApiStatus('error')
    }
  }

  return (
    <Page>
      <Panel>
        <Logos>
          <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
            <img src={viteLogo} alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" rel="noreferrer">
            <img src={reactLogo} alt="React logo" />
          </a>
        </Logos>
        <h1>Cloud Project Front</h1>
        <p>
          React + Vite 개발 환경이 준비되었습니다. 백엔드 API 주소만 설정하면 바로
          협업을 시작할 수 있어요.
        </p>
        <ButtonGroup>
          <PrimaryButton type="button" onClick={increment}>
            클릭 횟수: {count}
          </PrimaryButton>
          <SecondaryButton type="button" onClick={pingBackend}>
            백엔드 연결 확인
          </SecondaryButton>
        </ButtonGroup>
        <StatusBadge style={{ '--status-color': statusColorMap[apiStatus] }}>
          {statusLabelMap[apiStatus]}
        </StatusBadge>
      </Panel>
    </Page>
  )
}

export default App
