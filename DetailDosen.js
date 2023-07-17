import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Image,
  useWindowDimensions,
} from 'react-native';
import {
  Text, Divider, Card, Button, useTheme, Avatar,
} from 'react-native-paper';
import { useRoute, useLinkTo, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { theme } from '../../../../../helpers/theme';
import BackButton from '../../../../../components/BackButton';
import SendModal from '../../../../../components/Modal/SendApprovalModal';
import Breadcrumb from '../../../../../components/Breadcrumb';
import Logo from '../../../../../assets/avatar/avatar.png';
import {
  API_ENDPOINTS,
  USER_TYPE,
  CONFIRMATION_TEXT_ENUM,
  ROLE_LEVEL_ENUM,
} from '../../../../../helpers/constants';
import ApiRequest from '../../../../../helpers/apiRequest';
import authSelector from '../../../../../store/selectors/auth';
import Pencil from '../../../../../assets/icon/pencil-inverse.png';

import { sendRequest } from '../../../../../store/actions/profile';
import TextDisplay3 from '../../../../../components/Text/Thypography/TextDisplay3';
import TextTitle from '../../../../../components/Text/Thypography/TextTitle';
import TextSubheader from '../../../../../components/Text/Thypography/TextSubheader';
import TextHeadline from '../../../../../components/Text/Thypography/TextHeadline';
import TextListBoxHeader from '../../../../../components/TextListBoxHeader';
import TextListBoxItem from '../../../../../components/TextListBoxItem';
import { UserPrivilege } from '../../../../../helpers/utils';
import ActiveDeactiveConfirmationModal from '../../../../../components/Modal/ActiveDeactiveConfirmationModal';

const styles = StyleSheet.create({
  boxStyle: {
    backgroundColor: theme.colors.gray200,
    margin: 5,
    textAlign: 'center',
    padding: theme.gutter.spacingx,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderRadius: 10,
  },
  divider: {
    height: 2,
    width: '100%',
    backgroundColor: '#E7E4E4',
  },
  textLabel: {
    color: theme.colors.gray300,
    fontSize: 12,
    paddingBottom: 1,
    textTransform: 'uppercase',
  },
  textValue: {
    fontSize: 14,
    minHeight: 10,
    color: theme.colors.textbodyTitle,
  },
});

function DetailNonDosen() {
  const linkTo = useLinkTo();
  const dispatch = useDispatch();
  const themes = useTheme();
  const auth = useSelector(authSelector);

  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width > theme.screenSize.large;
  const navigation = useNavigation();
  const route = useRoute();
  const roleUser = auth?.data?.role?.master_role?.role_level?.label;
  const [data, setData] = React.useState([]);
  // const [metadata, setMetadata] = React.useState();

  const [isOpenConfirmationModal, setIsOpenConfirmationModal] = useState(false);
  const [isModalCallbackOpen, setIsModalCallbackOpen] = useState(false);
  const [modalMetadata, setModalMetadata] = useState({ success: false, label: '', infoLabel: '' });

  const [loading, setLoading] = React.useState(false);
  const [BreadcrumbOpt, setBreadcrumbOpt] = React.useState(route?.params?.origin === 'headers' ? [
    {
      name: 'Home',
      icon: 'home',
      linkTo: '/dashboard',
    },
    {
      name: 'Profil Pengguna',
      leaf: true,
    },
  ] : [
    {
      name: 'Home',
      icon: 'home',
      linkTo: '/dashboard',
    },
    {
      name: 'Akun',
    },
    {
      name: 'Daftar Pengguna',
      linkTo: '/accounts',
    },
    {
      name: 'Profil Pengguna',
      leaf: true,
    },
  ]);

  const ubah = () => {
    let detailId;

    // Start Conditional if untuk mencegah profile mengakses detail akun lain
    if (route?.params?.origin === 'headers') {
      detailId = auth?.data?.id || undefined;
    }

    if (route?.params?.origin === 'lembaga') {
      detailId = route?.params?.id || undefined;
    }

    if (route?.params?.origin === 'akun') {
      detailId = route?.params?.id || undefined;
    }

    linkTo(`/ubah-profil/${detailId}`);
  };

  const toggleConfirmationModal = () => {
    setIsOpenConfirmationModal((previousState) => !previousState);
  };

  const toggleModalCallback = () => {
    setIsModalCallbackOpen((previousState) => !previousState);
  };

  const onSendRequestDeactive = () => {
    // close confirmation modal
    toggleConfirmationModal();

    dispatch(sendRequest({
      token: auth?.data?.token,
      id: data?.user_id,
      callback: (response) => {
        if (response?.success) {
          setModalMetadata({
            success: true,
            label: 'Berhasil',
            infoLabel: data?.user?.issuance_status === 1 && !!data?.user?.issuance_by ? 'Akun telah di nonaktifkan' : 'Akun telah diaktifkan',
          });
        } else {
          setModalMetadata({
            success: false,
            label: data?.user?.issuance_status === 1 && !!data?.user?.issuance_by ? 'Gagal nonaktifkan akun' : 'Gagal mengaktifkan akun',
            infoLabel: '',
          });
        }
        toggleModalCallback();
      },
      areaId: auth?.data?.role?.master_role?.role_scope?.area_id,
    }));

    // if (roleUser === ROLE_LEVEL_ENUM.kepalaLembaga) navigation.navigate('Dashboard');
    // else navigation.navigate('DaftarPengguna');
  };

  const onDeactive = () => {
    toggleConfirmationModal();
  };

  const closeSendModal = () => {
    if (route?.params?.origin === 'akun') {
      navigation.navigate('DaftarPengguna');
    } else {
      navigation.navigate('Dashboard');
    }
    // switch (roleUser) {
    //   case ROLE_LEVEL_ENUM.kepalaLembaga:
    //     navigation.navigate('Dashboard');
    //     break;
    //   default:
    //     navigation.navigate('DaftarPengguna');
    //     break;
    // }
  };

  const _fetchData = async () => {
    setLoading(true);

    // let detailId;

    // Start Conditional if untuk mencegah profile mengakses detail akun lain
    // if (route?.params?.origin === 'headers') {
    //   detailId = auth?.data?.id || undefined;
    // }

    // if (route?.params?.origin === 'lembaga') {
    //   detailId = route?.params?.id || undefined;
    // }

    // if (route?.params?.origin === 'akun') {
    //   detailId = route?.params?.id || undefined;
    // }
    // End

    try {
      const headers = {
        Authorization: `Bearer ${auth?.data?.token}`,
      };
      const url = `${API_ENDPOINTS.personnels}/dikti/personnel/${route.params.noDosenId}`;
      const request = await ApiRequest.get(url, headers);
      if (request && request.status === 200) {
        setLoading(false);
        const response = await request.json();
        setData(response.results);
        // setMetadata(response?.metadata);
      } else {
        setData([]);
        throw Error();
      }
    } catch (e) {
      console.log('e', e);
      if (e?.errors?.code === 422) {
        navigation.navigate('page-not-found');
      }
      setData([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    _fetchData();
  }, [route, route.key]);

  let breadcrumbOptions = [];

  if (route?.params?.origin === 'headers') {
    breadcrumbOptions = [
      {
        name: 'Home',
        icon: 'home',
        linkTo: '/dashboard',
      },
      {
        name: 'Profil Pengguna',
        leaf: true,
      },
    ];
  }

  if (route?.params?.origin === 'lembaga') {
    breadcrumbOptions = [
      {
        name: 'Home',
        icon: 'home',
        linkTo: '/dashboard',
      },
      {
        name: 'Profil Pengguna',
        leaf: true,
      },
    ];
  }

  if (route?.params?.origin === 'akun') {
    breadcrumbOptions = [
      {
        name: 'Home',
        icon: 'home',
        linkTo: '/dashboard',
      },
      {
        name: 'Akun',
      },
      {
        name: 'Daftar Pengguna',
        linkTo: '/accounts',
      },
      {
        name: 'Profil Pengguna',
        leaf: true,
      },
    ];
  }

  const _onRoleLevel = (role) => {
    if (role === USER_TYPE.ESELON_I_KEMENAG) {
      return 'Eselon Satu Kemenag';
    }
    if (role === USER_TYPE.KEMENAG_KOTA_KAB) {
      return 'Kemenag Kota Kabupaten';
    }
    if (role === USER_TYPE.KEMENAG_PROVINSI) {
      return 'Kemenag Provinsi';
    }
    if (role === USER_TYPE.KEMENAG_PUSAT) {
      return 'Kemenag Pusat';
    }
    if (role === USER_TYPE.LEMBAGA_OPERATOR) {
      return 'Lembaga Operator';
    }
    if (role === USER_TYPE.LEMBAGA_KEPALA) {
      return 'Kepala Lembaga';
    }
    if (role === USER_TYPE.PAI) {
      return 'PAI';
    }
    if (role === USER_TYPE.KOPERTAIS) {
      return 'Kopertais';
    }

    return 'Administrator';
  };

  const _renderPositition = () => {
    if (!data?.institution) {
      return (
        <View
          style={{
            width: '100%',
            justifyContent: 'space-between',
            flexDirection: isLargeScreen ? 'row' : 'column',
          }}
        >
          <View
            style={{
              flex: 0.6,
              // paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
            }}
          >
            <View>
              <TextListBoxHeader>Posisi</TextListBoxHeader>

              <Text style={styles.textValue} testID="text-nsm-value" />
            </View>
          </View>
          <View
            style={{
              flex: 1,
            }}
          >
            <View>
              <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.position ? data?.position : '-'}</TextListBoxItem>
            </View>
          </View>
        </View>
      );
    }

    return (
      <></>
    );
  };

  const _buttonDeactive = () => {
    if (route?.params?.id !== auth?.data?.id
          && roleUser === ROLE_LEVEL_ENUM.kemenagPusat) {
      return (
        <Button
          compact
          // icon="chevron-left"
          mode="contained"
          color={theme.colors.dangerLighter}
          onPress={() => { onDeactive(); }}
          dark
          style={{
            padding: 0,
            margin: 0,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 10,
            }}
          >
            <Text
              style={{
                color: theme.colors.danger,
                textAlign: 'center',
                flex: 1,
                // marginRight: theme.gutter.spacingHalf,
              }}
            >
              {data?.user?.issuance_status === 1 && !!data?.user?.issuance_by ? 'Nonaktifkan Akun ini' : 'Aktifkan Akun ini'}
            </Text>
          </View>
        </Button>
      );
    }

    return (
      <></>
    );
  };

  return (

    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: isLargeScreen ? theme.gutter.spacing2x : theme.gutter.spacingHalf,
        paddingBottom: isLargeScreen ? theme.gutter.spacingx : theme.gutter.spacing3x,
      }}
    >
      <ActiveDeactiveConfirmationModal
        activate={data?.user?.issuance_status === 0 && !!data?.user?.issuance_by}
        onCLoseDialog={toggleConfirmationModal}
        onCancel={toggleConfirmationModal}
        onContinue={onSendRequestDeactive}
        onDismiss={toggleConfirmationModal}
        title="Confirmation"
        visible={isOpenConfirmationModal}
        message={data?.user?.issuance_status === 1 && !!data?.user?.issuance_by
          ? CONFIRMATION_TEXT_ENUM.deactivateAccount : CONFIRMATION_TEXT_ENUM.activateAccount}
        txtNegatifButton="Tidak"
        txtPositifButton="Ya"
        isLoading={false}
      />

      <SendModal
        isOpen={isModalCallbackOpen}
        type={modalMetadata?.success ? 'success' : 'error'}
        text={modalMetadata?.label}
        textInfo={modalMetadata?.infoLabel}
        toggleModal={toggleModalCallback}
        onClosePressed={closeSendModal}
      />

      {/* Bread Crumb Start */}
      <View style={{ paddingTop: theme.gutter.spacingx }}>
        <View style={{
          alignSelf: 'flex-start',
        //   marginBottom: theme.gutter.spacingx,
        }}
        >
          <Breadcrumb items={[
            {
              name: 'Home',
              icon: 'home',
              linkTo: '/dashboard',
            },
            {
              name: 'Kelembagaan',
            },
            {
              name: 'Daftar Dosen & Non Dosen',
              linkTo: '/institutions',
            },
            {
              name: 'Detail Dosen & Non Dosen',
              leaf: true,
            },
          ]}
          />
        </View>
      </View>
      {/* Bread Crumb End */}

      <BackButton
        goBack={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            linkTo('/institutions');
          }
        }}
      />

      <TextDisplay3
        style={{
          marginBottom: theme.gutter.spacingx,
        }}
      >
        Detail Dosen
      </TextDisplay3>
      <Divider />
      <View>
        <Card
          elevation={3}
          style={{
            marginTop: 20,
            backgroundColor: theme.colors.white,
            borderRadius: 19,
            // eslint-disable-next-line max-len
            // boxShadow: '0px 1.90394px 3.80788px rgba(40, 41, 61, 0.04), 0px 7.61575px 15.2315px rgba(96, 97, 112, 0.16)',
          }}
        >
          <View style={{ flexDirection: isLargeScreen ? 'row' : 'column' }}>
            <View
              style={{
                [isLargeScreen ? 'width' : 'flex']: isLargeScreen ? 226 : 2,
                backgroundColor: '#eee',
                borderBottomLeftRadius: !isLargeScreen ? 0 : 10,
                borderTopLeftRadius: !isLargeScreen ? 0 : 10,
                justifyContent: 'center',
                padding: theme.gutter.spacingx,
                flexDirection: 'row',
              }}
            >
              <Image
                source={data?.photo ? data?.photo : Logo}
                style={{
                  width: 160, // fileUploadPhoto ? 160 : 100,
                  height: 160, // fileUploadPhoto ? 160 : 100,
                  // position: 'absolute',
                  overflow: 'hidden',
                  borderRadius: 79,
                }}
                resizeMode="cover"
              />
            </View>
            <View
              style={{
                [isLargeScreen ? 'flex' : 'width']: isLargeScreen ? 1 : '100%',
                paddingVertical: theme.gutter.spacingHalf,
                paddingHorizontal: isLargeScreen ? theme.gutter.spacingx : theme.gutter.spacingHalf,
                justifyContent: 'space-between',
                marginTop: 30,
                marginLeft: 10,
              }}
            >
              <View
                style={{ paddingBottom: theme.gutter.spacingHalf }}
                testID="text-name"
              >
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      paddingBottom: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextHeadline>{data?.full_name ?? '-'}
                      </TextHeadline>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                </View>
                <Divider />
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                    marginTop: 20
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>STATUS KEPEGAWAIAN</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.m_employee_status?.name ? data?.m_employee_status?.name : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>NIP</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.nip ? data?.nip : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>NIK</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.nik ? data?.nik : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>NUPTK</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.nuptk ? data?.nuptk : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>No PTK</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.ptk_num ? data?.ptk_num : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>TMT Pegawai</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.tmt_dosen ? data?.tmt_dosen : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>TMT Guru / Tanggal SK PTK</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.start_working_date ? data?.start_working_date : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>No Handphone</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.mobile_num ? data?.mobile_num : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>Email</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.email ? data?.email : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                {/* <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>Email Akun Madrasah Hebat</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.email ? data?.email : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View> */}
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>Jenis Kelamin</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.m_gender?.name ? data?.m_gender?.name : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                {/* {UserPrivilege(auth?.data?.role?.master_role?.level)
              === USER_TYPE.LEMBAGA_OPERATOR && (_renderPositition())} */}
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>TEMPAT LAHIR</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.birth_place ? data?.birth_place : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>TANGGAL LAHIR</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.birth_date ? moment(data?.birth_date).format('DD MMMM YYYY') : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>Agama</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.m_religion?.name ? data?.m_religion?.name : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>Golongan Darah</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.m_blood_type?.name ? data?.m_blood_type?.name : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>Status Tempat Tinggal</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.m_residence_status?.name ? data?.m_residence_status?.name : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>ALAMAT</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.address ? data?.address : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                {/* <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>Transportasi ke sekolah</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.m_transportation?.name ? data?.m_transportation?.name : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>Jarak Tempat Tinggal - Madrasah</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.m_residence_distance?.name ? data?.m_residence_distance?.name : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>Waktu Tempuh</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.time ? data?.time : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View> */}
                <Divider />
                <TextTitle
                style={{marginTop: 20, marginBottom: 20}}
                >
                  INFO KELUARGA
                </TextTitle>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>Nama Ibu Kandung</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.mother_full_name ? data?.mother_full_name : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>Status Perkawinan</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.m_marital_status?.name ? data?.m_marital_status?.name : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>Nama Suami / Istri</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.spouse_name ? data?.spouse_name : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>Jumlah Anak</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.number_of_children ? data?.number_of_children : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                <Divider />
                <TextTitle
                style={{marginTop: 20, marginBottom: 20}}
                >
                  INFO PENUGASAN
                </TextTitle>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>Tugas Pokok</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.tugas_pokok ? data?.tugas_pokok : 'Tugas Pokok'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: isLargeScreen ? 'row' : 'column',
                  }}
                >
                  <View
                    style={{
                      flex: 0.6,
                      paddingTop: isLargeScreen ? 0 : theme.gutter.spacingHalf,
                    }}
                  >
                    <View>
                      <TextListBoxHeader>Jumlah Jam Ajar dalam 1 Minggu</TextListBoxHeader>

                      <Text style={styles.textValue} testID="text-nsm-value" />
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View>
                      <TextListBoxItem>{isLargeScreen ? ': ' : ''}{data?.teaching_hours_in_one_week ? data?.teaching_hours_in_one_week : '-'}</TextListBoxItem>
                    </View>
                  </View>
                </View>
                {/* <Divider /> */}
                {/* {route?.params?.origin !== 'headers' && (
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
                    <Button
                      compact
                      // icon="chevron-left"
                      mode="contained"
                      color={theme.colors.light300}
                      onPress={() => { closeSendModal(); }}
                      dark
                      style={{
                        padding: 0,
                        margin: 0,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginRight: 15,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingHorizontal: 10,
                        }}
                      >
                        <Avatar.Icon
                          size={20}
                          icon="chevron-left"
                          color={theme.colors.black}
                          style={{
                            backgroundColor: theme.colors.light300,
                            // marginLeft: theme.gutter.spacingHalf,
                          }}
                        />
                        <Text
                          style={{
                            color: theme.colors.black,
                            textAlign: 'center',
                            // flex: 1,
                            // marginRight: theme.gutter.spacingHalf,
                          }}
                        >
                          Kembali
                        </Text>
                      </View>
                    </Button>
                    {_buttonDeactive()}
                  </View>
                )}
                {route?.params?.origin === 'headers' && (
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
                  <Button
                    compact
                    icon={Pencil}
                    mode="contained"
                    color={themes.colors.primary}
                    onPress={() => { ubah(); }}
                    dark
                    style={{
                      padding: 0,
                      margin: 0,
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text
                        style={{
                          color: theme.colors.white,
                          textAlign: 'center',
                          flex: 1,
                          marginRight: theme.gutter.spacingHalf,
                        }}
                      >
                        Ubah
                      </Text>
                    </View>
                  </Button>
                </View>
                )} */}
              </View>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

export default DetailNonDosen;
