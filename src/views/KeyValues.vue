<template>
    <div>
      <el-table
        :data="tableData.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))"
        style="width: 100%">
        <el-table-column
          label="KEY"
          prop="date">
        </el-table-column>
        <el-table-column
          label="VALUE"
          prop="name">
        </el-table-column>
        <el-table-column
          align="right">
          <template slot-scope="scope">
            <i class="el-icon-view" @click="detail(scope.$index, scope.row)"></i>
          </template>
        </el-table-column>
      </el-table>
    </div>
</template>

<script>
export default {
  name: 'KeyValues',
  data () {
    return {
      tableData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄'
      }],
      search: ''
    }
  },
  methods: {
    handleEdit (index, row) {
      console.log(index, row)
    },
    detail (index, row) {
    },
    handleDelete (index, row) {
      console.log(index, row)
    }
  }
}
</script>

<style scoped>

</style>
