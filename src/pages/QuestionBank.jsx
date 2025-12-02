import { Link } from "react-router-dom";

const createSlug = (text) => {
    if (!text) return "";
    return text
        .toString()
        .replace(/İ/g,'i')
        .toLowerCase()
        .trim()
        .replace(/\s+/g,'-')
}

const SubjectSection = ({ subject,title, topics }) => (
    <div className="w-full md:w-1/3 px-4 mb-8">
        <h2 className="text-2xl font-medium mb-4 text-center md:text-left">{title}</h2>
        <div className="bg-white rounded-lg shadow-xl ring-2 ring-gray-200 p-6">
            {topics.map((topic, index) => (
                <div key={index} className="mb-4">
                    {topic.title && <Link to={`/questions/${subject}/${createSlug(topic.title)}`} className="block text-left w-full py-2 px-4 my-1 text-xl font-medium text-black  hover:bg-gray-200 rounded-md transition-colors duration-200">{topic.title}</Link>}
                    {topic.items && (
                        <div className="pl-4">
                            {topic.items.map((item, subIndex) => (
                                <Link to={`/questions/${subject}/${createSlug(item)}`} key={subIndex} className="block text-left w-full py-2 px-4 my-1 text-black  hover:bg-gray-200 rounded-md transition-colors duration-200 text-lg">
                                    {item}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

export default function QuestionBank() {
    const azerbaijaniTopics = [
        {
            items: ["Fonetika", "Leksika", "Sözün Tərkibi", "Söz Yaradıcılığı"],
        },
        {
            title: "Əsas Nitq Hissələri",
            items: ["İsim", "Sifət", "Say", "Əvəzlik", "Feil", "Zərf","Feilin Təsriflənməyən formaları"],
        },
        {
            title: "Köməkçi Nitq Hissələri",
            items: ["Qoşma", "Bağlayıcı", "Ədat", "Modal söz", "Nida"],
        },
        {
            title: "Söz Birləşməsi və Cümlə",
            items: ["Söz Birləşməsi", "Feili Birləşmələr və onların növləri", "Sintaktik Əlaqələr və onların növləri"],
        },
        {
            title: "Cümlənin Baş Üzvləri",
            items: ["Mübtəda", "Xəbər"],
        },
        {
            title: "Cümlənin ikinci dərəcəli üzvləri",
            items: ["Tamamlıq", "Təyin", "Zərflik"],
        },
        {
            items: ["Həmcins Üzvlər", "Əlavələr", "Ara Sözlər", "Xitab"],
        },
        {
            title: "Cümlə",
            items: ["Cümlənin məqsəd və intonasiyaya görə növləri", "Baş üzvlərin iştirakına görə cümlənin növləri", "Cümlənin quruluşca növləri"],
        },
        {
            title: "Mürəkkəb Cümlə",
            items: ["Tabesiz Mürəkkəb Cümlə", "Tabeli Mürəkkəb Cümlələr"],
        },
        {
            items: ["Dil", "Yazı", "Durğu İşarələri", "Dilin üslubi imkanlarının təzahür formaları", "Xülasə", "Tezis"],
        },
    ];

    const mathTopics = [
        // Add math topics here
        {
            title:"Həqiqi Ədədlər",
            items:["Natural ədədlər","Bölünmə","Adi Kəsrlər","Onluq Kəsrlər","Rasional və İrrasional Ədədlər","Həqiqi Ədədlər"],
        },
        {
            title:"Kompleks Ədədlər",
            items:["Kompleks ədədin tərifi, qoşma kompleks ədədlər","Kompleks ədədlərin toplanması, çıxılması, vurulması, bölünməsi və qüvvətə yüksəldilməsi"],
        },
        {
            title:"Nisbət,Tənasüb və Faiz",
            items:["Nisbət və Tənasüb","Faiz"],
        },
        {
            title: "Rasional İfadələr",
            items:["Ümumi","Çoxhədlilər","Rasional İfadələrin Çevrilmələri"],
        },
        {
            title: "n-ci DƏRƏCƏDƏN KÖK. İRRASİONAL İFADƏLƏR.HƏQİQİ ÜSTLÜ QÜVVƏT ",
            items:["Kvadrat Kök","Tam və Həqiqi Üstlü Qüvvət","İrrasional İfadələrin Çevrilmələri"],
        },
        {
            title: "ÖLÇMƏ.STATİSTİKANIN ELEMENTLƏRİ.ÇOXLUQLAR.",
            items:["Ölçmə","Statistika Elementləri","Çoxluqlar","Birləşmələr Nəzəriyyəsi","Ehtimal Nəzəriyyəsi"],
        },
        {
            title:"Birdəyişənli Tənliklər və Tənliklərin tətbiqi ilə məsələ həlli",
            items:["Xətti Tənliklər","Kvadrat Tənliklər","Digər Tənliklər"],
        },
        {
            title:"Tənliklər sistemi və tənliklər sisteminin tətbiqi ilə məsələ həlli",
            items:["İkidəyişənli xətti tənlik","İkidəyişənli xətti tənliklər sistemi və onun həlli üsulları. Eynigüclü tənliklər sistemi","İkidəyişənli xətti tənliklər sisteminin kökünün varlığının araşdırılması","Tənliklər sisteminin tətbiqi ilə məsələ həlli"],
        },
        {
            title:"Bərabərsizliklər",
            items:["Xətti Bərabərsizliklər","Digər Bərabərsizliklər"],
        },
        {
          title:"Ədədi Ardıcıllıqlar",
          items:["Silsilələr"],
        },
        {
          title:"Funksiyalar və Qrafiklər",
          items:["Ümumi Anlayışlar","Xüsusi Funksiyalar","Qrafiklərin çevrilməsi"],
        },
        {
            title:"Triqonometrik funksiyalar və Tənliklər",
            items:["Bucağ,bucağın dərəcə və radian ölçüsü","İxtiyari bucağın sinusu, kosinusu, tangensi və kotangensinin tərifi","y=sinx,y=cosx,y=tanx,y=cotx funksiyalarının xassələri və qrafikləri","Triqonometrik eyniliklər,çevirmə düsturları","İki bucağın cəmi və fərqinin triqonometrik funksiyaları. İkiqat arqumentin triqonometrik funksiyaları. Yarım arqumentin triqonometrik funksiyaları","sina və cosa-nın tan(α/2) ilə ifadəsi.Cəmin(fərqin) hasilə çevrilməsi.Hasili cəmə çevirmə düsturları","Tərs triqonometrik funksiyalar, onların xassələri və qrafikləri","riqonometrik tənliklər və onların həlli üsulları"],
        },
        {
            title:"Üstlü və Loqarifmik funksiyalar",
            items:["Üstlü funksiya, onun xassələri və qrafiki","Ədədin loqarifmi və onun xassələri. Loqarifmik funksiya, onun xassələri və qrafiki","Üstlü və loqarifmik ifadələrin çevrilməsi"],
        },
        {
            title:"Üstlü və Loqarifmik tənliklər və bərabərsizliklər",
            items:["Üstlü tənliklər və onların həll üsulları. Loqarifmik tənliklər və onların həll üsulları","Üstlü bərabərsizliklər. Loqarifmik bərabərsizliklər"],
        },
        {
            title:"Sadə Həndəsi Fiqurlar",
            items:["Əsas Anlayışlar","Düz Xətlərin Qarşılıqlı Vəziyyəti"],
        },
        {
            title:"Çevrə və Dairə",
            items:["Çevrə, dairə, çevrə qövsü. Dairə sektoru və dairə seqmenti. Çevrənin və çevrə qövsünün uzunluğu","Düz xətlə çevrənin qarşılıqlı vəziyyəti: toxunan və kəsən. Toxunanlar və kəsənlərin xassələri. Çevrəyə çəkilmiş toxunanlar və kəsənlər arasındakı bucaqlar","Mərkəzi bucaq, çevrə daxilinə çəkilmiş bucaq. Çevrədə vətərlərin xassələri. Çevrədə vətər və kəsənlərin parçalarının mütənasibliyi","İki çevrənin qarşılıqlı vəziyyəti"],
        },
        {
            title:"Üçbucaqlar",
            items:[],
        },
        {
            title:"Dördbucaqlılar və Çoxbucaqlılar",
            items:[],
        },
        {
            title:"Fiqurların Sahəsi",
            items:[],
        },
        {
            title:"Koordinatlar Üsulu,Hərəkət və Oxşarlıq",
            items:["Koordinatlar Üsulu","Hərəkət və Oxşarlıq","Vektorlar"],
        },
        {
            title:"Fəzada nöqtə,düz xətt və müstəvi",
            items:[],
        },
        {
            title:"Çoxüzlülər,onların səthi və həcmi",
            items:[],
        },
        {
            title:"Fırlanma fiqurları,onların səthi və həcmi",
            items:[],
        },
    ];

    const englishTopics = [
        // Add English topics here
        {
            title:"Fonetika(Phonetics)",
            items:[],
        },
        {
            title:"Leksikologiya(Lexicology)",
            items:[],
        },
        {
            title:"Morfologiya(Morphology)",
            items:["İsim(The noun)","Artikl(The Article)","Sifət(The adjective)","Say(The numeral)","Əvəzlik(The pronoun)","Zərf(The adverb)","Ədat(The particle)","Feil(The verb)","Sözönü(The preposition)","Bağlayıcı(The conjuction)"],
        },
        {
            title:"Sintaksis(Syntax)",
            items:["Söz birləşməsi(The collocation)","Sadə cümlə və növləri(The simple sentence and its types)","Mürəkkəb tamamlıq(The complex object)","'So do I.Neither do I' tipli cümlələr","Şəxssiz cümlələr","Mürəkkəb cümlə(The complex sentence)","Vasitəli və Vasitəsiz nitq(Direct and İndirect or Reported speech)"],
        },
    ];

    return (
        <>
            <section className="bg-gray-50 min-h-screen">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold">Fənlər və Sual Bankı</h2>
                        <p className="text-lg text-gray-600 mt-2">Hazırlıq görmək istədiyiniz fənn və mövzunu seçin</p>
                    </div>
                    <div className="flex flex-wrap -mx-4">
                        <SubjectSection subject="azerbaijani" title="Azərbaycan dili" topics={azerbaijaniTopics} />
                        <SubjectSection subject="math" title="Riyaziyyat" topics={mathTopics} />
                        <SubjectSection subject="english" title="İngilis dili" topics={englishTopics} />
                    </div>
                </div>
            </section>
        </>
    );
}