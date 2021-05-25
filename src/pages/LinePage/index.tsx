import React, { useEffect, useState } from 'react';
import CardLayout from 'components/CardLayout/CardLayout';
import TextButton from 'components/shared/TextButton/TextButton';
import IconButton from 'components/shared/IconButton/IconButton';
import Modal from 'components/shared/Modal/Modal';
import LineModal from 'components/LineModal/LineModal';
import useFetch from 'hooks/useFetch';
import { ButtonType, Line, Station } from 'types';
import deleteIcon from 'assets/delete.png';
import editIcon from 'assets/edit.png';
import { API_STATUS, END_POINT } from 'constants/api';
import { ALERT_MESSAGE, CONFIRM_MESSAGE } from 'constants/messages';
import Styled from './styles';

const LinePage = () => {
  const { response: lines, fetchData: getLinesAsync } = useFetch<Line[]>();
  const { fetchData: deleteLinesAsync } = useFetch<Line[]>();
  const { response: stations, fetchData: getStationsAsync } = useFetch<Station[]>();

  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedLine, setSelectedLine] = useState<{ name: string; color: string }>();
  const [modalTitle, setModalTitle] = useState<string>('');

  // TODO: lines 상태 관리
  const closeModal = async () => {
    setModalOpen(false);
    setSelectedLine(undefined);
    await getLinesAsync('GET', END_POINT.LINES);
  };

  const openLineCreateModal = async () => {
    setModalOpen(true);
    setModalTitle('노선 생성');

    await getStations();
  };

  const openLineEditModal = async (line: { name: string; color: string }) => {
    setSelectedLine(line);
    setModalOpen(true);
    setModalTitle('노선 수정');
  };

  const getStations = async () => {
    const res = await getStationsAsync('GET', END_POINT.STATIONS);

    if (res.status === API_STATUS.REJECTED) {
      alert(ALERT_MESSAGE.FAIL_TO_GET_STATIONS);
    }
  };

  const deleteLine = async (id: Line['id']) => {
    if (!window.confirm(CONFIRM_MESSAGE.DELETE)) return;

    const res = await deleteLinesAsync('DELETE', `${END_POINT.LINES}/${id}`);

    if (res.status === API_STATUS.REJECTED) {
      alert(ALERT_MESSAGE.FAIL_TO_DELETE_LINE);
    } else {
      await getLinesAsync('GET', END_POINT.LINES);
    }
  };

  useEffect(() => {
    const fetchLines = async () => {
      const res = await getLinesAsync('GET', END_POINT.LINES);
      console.log(lines);
      if (res.status === API_STATUS.REJECTED) {
        alert(ALERT_MESSAGE.FAIL_TO_GET_LINES);
      }
    };

    fetchLines();
  }, []);

  return (
    <>
      <CardLayout title={'노선 관리'}>
        <Styled.AddButtonWrapper>
          <TextButton
            text="노선 추가"
            styleType={ButtonType.FILLED}
            onClick={openLineCreateModal}
          />
        </Styled.AddButtonWrapper>
        <Styled.LinesContainer>
          {lines?.map(({ id, name, color }) => (
            <Styled.LineItem key={id}>
              <Styled.Color color={color}></Styled.Color>
              {name}
              <Styled.ButtonsContainer>
                <IconButton onClick={() => openLineEditModal({ name, color })}>
                  <Styled.Icon src={editIcon} alt="edit" />
                </IconButton>
                <IconButton onClick={() => deleteLine(id)}>
                  <Styled.Icon src={deleteIcon} alt="delete" />
                </IconButton>
              </Styled.ButtonsContainer>
            </Styled.LineItem>
          ))}
        </Styled.LinesContainer>
      </CardLayout>

      <Modal isOpen={isModalOpen} title={modalTitle} onClose={closeModal}>
        <LineModal selectedLine={selectedLine} stations={stations} closeModal={closeModal} />
      </Modal>
    </>
  );
};

export default LinePage;
