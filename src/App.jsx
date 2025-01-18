import React, { useState, useEffect } from 'react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { MdDarkMode, MdLightMode } from 'react-icons/md'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import './App.css'

ChartJS.register(ArcElement, Tooltip, Legend);

const categoryColors = {
  'Fauzi': '#ec407a',
  'Frien': '#ffa726',
  'Dapur': '#66bb6a',
  'Snack': '#42a5f5',
  'Harian': '#ab47bc',
  'Transportasi': '#78909c',
  'Rumah': '#4CAF50',
  'Uwais': '#FF7043',
  'Tak Terduga': '#8D6E63'
};

const categories = Object.keys(categoryColors)


// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#333',
    paddingBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  date: {
    fontSize: 12,
    color: '#666'
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  table: {
    display: 'flex',
    width: '100%',
    borderWidth: 1,
    borderColor: '#DDD'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    paddingVertical: 8
  },
  tableHeader: {
    backgroundColor: '#F5F5F5',
    fontWeight: 'bold'
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 12,
    color: '#333'
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#333'
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  }
})

const ReportDocument = ({ expenses, totalExpenses }) => {
  // Calculate category totals
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  // Convert to array and sort by total
  const sortedCategories = Object.entries(categoryTotals)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Laporan Pengeluaran</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detail Pengeluaran</Text>
          <View style={[styles.table, styles.tableHeader]}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Tanggal</Text>
              <Text style={styles.tableCell}>Kategori</Text>
              <Text style={styles.tableCell}>Deskripsi</Text>
              <Text style={styles.tableCell}>Jumlah</Text>
            </View>
          </View>
          {expenses.map((expense) => (
            <View style={styles.tableRow} key={expense.id}>
              <Text style={styles.tableCell}>{expense.date}</Text>
              <Text style={styles.tableCell}>{expense.category}</Text>
              <Text style={styles.tableCell}>{expense.description}</Text>
              <Text style={styles.tableCell}>
                Rp {expense.amount.toLocaleString('id-ID')}
              </Text>
            </View>
          ))}
        </View>

        {/* Category Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan Berdasarkan Kategori</Text>
          <View style={[styles.table, styles.tableHeader]}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Kategori</Text>
              <Text style={styles.tableCell}>Total</Text>
            </View>
          </View>
          {sortedCategories.map(({ category, total }) => (
            <View style={styles.tableRow} key={category}>
              <Text style={styles.tableCell}>{category}</Text>
              <Text style={styles.tableCell}>
                Rp {total.toLocaleString('id-ID')}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <Text style={styles.total}>Total Pengeluaran:</Text>
          <Text style={styles.total}>
            Rp {totalExpenses.toLocaleString('id-ID')}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

const App = () => {
  const [expenses, setExpenses] = useState([])
  const [darkMode, setDarkMode] = useState(false)
  const [formData, setFormData] = useState(() => {
    // Check localStorage for saved date
    const savedDate = localStorage.getItem('selectedDate');
    const today = new Date().toISOString().split('T')[0];
    
    return {
      date: savedDate || today,
      category: categories[0],
      description: '',
      amount: ''
    }
  })

  useEffect(() => {
    const savedExpenses = JSON.parse(localStorage.getItem('expenses')) || []
    setExpenses(savedExpenses)
  }, [])

  const handleInputChange = (e) => {
    const newFormData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newFormData);
    
    // If date changed, save to localStorage
    if (e.target.name === 'date') {
      localStorage.setItem('selectedDate', newFormData.date);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newExpense = {
      ...formData,
      id: Date.now(),
      amount: parseInt(formData.amount)
    }
    const updatedExpenses = [...expenses, newExpense]
    setExpenses(updatedExpenses)
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses))
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: categories[0],
      description: '',
      amount: ''
    })
  }

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengeluaran ini?')) {
      const updatedExpenses = expenses.filter(expense => expense.id !== id)
      setExpenses(updatedExpenses)
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses))
    }
  }

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset semua data? Tindakan ini tidak dapat dibatalkan.')) {
      setExpenses([])
      localStorage.removeItem('expenses')
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: categories[0],
        description: '',
        amount: ''
      })
    }
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const chartData = {
    labels: categories,
    datasets: [
      {
        label: 'Total Pengeluaran',
        data: categories.map(cat => 
          expenses
            .filter(exp => exp.category === cat)
            .reduce((sum, exp) => sum + exp.amount, 0)
        ),
        backgroundColor: Object.values(categoryColors)
      }
    ]
  }

  return (
    <div className={`container ${darkMode ? 'dark-mode' : ''}`}>
      <button 
        onClick={() => setDarkMode(!darkMode)}
        className="mode-toggle"
      >
        {darkMode ? <MdLightMode /> : <MdDarkMode />}
      </button>

      <h1>Pelacak Pengeluaran</h1>

      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label>Tanggal:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Kategori:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Deskripsi:</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Masukkan deskripsi pengeluaran"
            required
          />
        </div>

        <div className="form-group">
          <label>Jumlah (IDR):</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="Masukkan jumlah"
            required
          />
        </div>

        <button type="submit">Tambah Pengeluaran</button>
      </form>

      <div className="summary">
        <h2>Ringkasan Bulan Ini</h2>
        <p>Total Pengeluaran: Rp {totalExpenses.toLocaleString('id-ID')}</p>
        <div className="chart-container">
          <Pie data={chartData} />
        </div>
      </div>

      <div className="expense-list">
        <h2>Daftar Pengeluaran</h2>
        {expenses.map((expense) => (
          <div key={expense.id} className="expense-item">
            <div className="expense-details">
              <span>{expense.date}</span>
              <span className={`category-${expense.category.toLowerCase().replace(/ /g, '-')}`}>
                {expense.category}
              </span>
              <span>{expense.description}</span>
              <span>Rp {expense.amount.toLocaleString('id-ID')}</span>
            </div>
            <button 
              onClick={() => handleDelete(expense.id)}
              className="delete-btn"
            >
              Hapus
            </button>
          </div>
        ))}
      </div>

      <div className="action-buttons">
        <button 
          onClick={handleReset}
          className="reset-btn"
        >
          Reset
        </button>
        
        <PDFDownloadLink
          document={<ReportDocument expenses={expenses} totalExpenses={totalExpenses} />}
          fileName={`laporan-pengeluaran-${new Date().toISOString().split('T')[0]}.pdf`}
          className="download-btn"
        >
          {({ loading }) => (loading ? 'Menyiapkan laporan...' : 'Unduh')}
        </PDFDownloadLink>
      </div>
    </div>
  )
}

export default App
